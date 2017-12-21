const bodyParser = require('body-parser')
const logger = console
const payPledgePaypal = require('../lib/payments/paypal/payPledge')
const generateMemberships = require('../lib/generateMemberships')
const sendPendingPledgeConfirmations = require('../lib/sendPendingPledgeConfirmations')
const debug = require('debug')('crowdfundings:webhooks:all')

const getWebhookHandler = require('../lib/payments/stripe/webhookHandler')

module.exports = async (server, pgdb, t) => {
  const handleWebhook = await getWebhookHandler({ pgdb, t })

  // https://stripe.com/docs/webhooks
  server.post('/payments/stripe',
    bodyParser.raw({type: '*/*'}),
    async (req, res) => {
      debug('stripe: %O', req.body)
      await pgdb.public.paymentsLog.insert({
        method: 'STRIPE',
        pspPayload: JSON.parse(req.body.toString('utf8'))
      })

      let code
      try {
        code = await handleWebhook({
          req
        })
      } catch (e) {
        code = 500
      }
      return res.sendStatus(code)
    })

  server.post('/payments/stripe/connected',
    bodyParser.raw({type: '*/*'}),
    async (req, res) => {
      debug('stripe:connected %O', req.body)
      await pgdb.public.paymentsLog.insert({
        method: 'STRIPE',
        pspPayload: JSON.parse(req.body.toString('utf8'))
      })

      let code
      try {
        code = await handleWebhook({
          req,
          connected: true
        })
      } catch (e) {
        code = 500
      }
      return res.sendStatus(code)
    })

  // https://e-payment-postfinance.v-psp.com/de/guides/integration%20guides/e-commerce/transaction-feedback#servertoserver-feedback
  server.get('/payments/pf', async (req, res) => {
    await pgdb.public.paymentsLog.insert({
      method: 'POSTFINANCECARD',
      pspPayload: req.query
    })
    return res.sendStatus(200)
  })

  // https://developer.paypal.com/docs/integration/direct/webhooks/rest-webhooks/
  server.post('/payments/paypal',
    bodyParser.urlencoded({extended: true}),
    async (req, res) => {
      const { body } = req
      await pgdb.public.paymentsLog.insert({
        method: 'PAYPAL',
        pspPayload: body
      })

      // end connection
      res.sendStatus(200)

      // payPledge in case that didn't happen already:
      // in case users close the paypal tab before being redirected back to us,
      // we only get notified about the payment via this webhook.
      // we ignore non Completed status changes for now
      if (body.payment_status === 'Completed') {
        const pledgeId = body.item_name

        const transaction = await pgdb.transactionBegin()
        let userId
        try {
          // load pledge
          // FOR UPDATE to wait on other transactions
          const pledge = (await transaction.query(`
            SELECT *
            FROM pledges
            WHERE id = :pledgeId
            FOR UPDATE
          `, {
            pledgeId
          }))[0]

          if (pledge && pledge.status !== 'SUCCESSFUL') {
            userId = pledge.userId

            const pspPayload = {
              ...body,
              tx: body.txn_id, // normalize with redirect params
              webhook: true
            }
            const pledgeStatus = await payPledgePaypal({
              pledgeId: pledge.id,
              total: pledge.total,
              pspPayloadRaw: pspPayload,
              transaction,
              t,
              logger
            })
            if (pledge.status !== pledgeStatus) {
              // generate Memberships
              if (pledgeStatus === 'SUCCESSFUL') {
                await generateMemberships(pledge.id, transaction, t, logger)
              }

              // update pledge status
              await transaction.public.pledges.updateOne({
                id: pledge.id
              }, {
                status: pledgeStatus,
                sendConfirmMail: true
              })
            }
          }
          await transaction.transactionCommit()
        } catch (e) {
          await transaction.transactionRollback()
          logger.info('transaction rollback', { req: req._log(), error: e })
          throw e
        }

        if (userId) {
          // send mail immediately
          await sendPendingPledgeConfirmations(userId, pgdb, t)
        }
      }
    })

  return server
}
