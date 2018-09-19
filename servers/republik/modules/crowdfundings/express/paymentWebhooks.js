const bodyParser = require('body-parser')
const logger = console
const payPledgePF = require('../lib/payments/postfinance/payPledge')
const payPledgePaypal = require('../lib/payments/paypal/payPledge')
const generateMemberships = require('../lib/generateMemberships')
const sendPendingPledgeConfirmations = require('../lib/sendPendingPledgeConfirmations')
const debug = require('debug')('crowdfundings:webhooks:all')

const getWebhookHandler = require('../lib/payments/stripe/webhookHandler')

const {
  STRIPE_TEST_MODE
} = process.env

module.exports = async (server, pgdb, t) => {
  const handleWebhook = await getWebhookHandler({ pgdb, t })

  const handleStripeWebhook = async (req, res, connected) => {
    const body = JSON.parse(req.body.toString('utf8'))
    debug(`stripe${connected ? ':connected' : ''} %O`, body)

    // stripe sends test payments to test and prod endpoints
    // ignore test events on production
    if (!body.livemode && !STRIPE_TEST_MODE) {
      debug('webhookHandler ignoring test event')
      return res.sendStatus(200)
    }

    await pgdb.public.paymentsLog.insert({
      method: 'STRIPE',
      pspPayload: body
    })

    let code
    try {
      code = await handleWebhook({
        req,
        connected
      })
    } catch (e) {
      code = 500
    }
    return res.sendStatus(code)
  }

  // https://stripe.com/docs/webhooks
  server.post('/payments/stripe',
    bodyParser.raw({type: '*/*'}),
    async (req, res) => {
      return handleStripeWebhook(req, res, false)
    }
  )

  server.post('/payments/stripe/connected',
    bodyParser.raw({type: '*/*'}),
    async (req, res) => {
      return handleStripeWebhook(req, res, true)
    }
  )

  // https://e-payment-postfinance.v-psp.com/de/guides/integration%20guides/e-commerce/transaction-feedback#servertoserver-feedback
  server.get('/payments/pf', async (req, res) => {
    const { query: body } = req
    debug('pf %O', body)

    await pgdb.public.paymentsLog.insert({
      method: 'POSTFINANCECARD',
      pspPayload: body
    })

    // end connection
    res.sendStatus(200)

    // payPledge in case that didn't happen already:
    // in case users close the paypal tab before being redirected back to us,
    // we only get notified about the payment via this webhook.
    // accepted status see: servers/republik/modules/crowdfundings/lib/payments/postfinance/payPledge.js
    const status = parseInt(body.STATUS)
    if (status !== 9 && status !== 91) {
      return
    }

    const pledgeId = body.orderID

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
        debug('pf run payPledgePF via webhook')
        userId = pledge.userId

        const pspPayload = {
          ...body
        }
        const pledgeStatus = await payPledgePF({
          pledgeId: pledge.id,
          total: pledge.total,
          pspPayload,
          userId,
          transaction,
          t,
          logger
        })
        if (pledge.status !== pledgeStatus) {
          // generate Memberships
          if (pledgeStatus === 'SUCCESSFUL') {
            await generateMemberships(pledge.id, transaction, t, null, logger)
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
              pspPayload,
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
