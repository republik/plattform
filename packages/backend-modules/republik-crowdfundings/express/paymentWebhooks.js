const bodyParser = require('body-parser')
const logger = console
const payPledgePF = require('../lib/payments/postfinance/payPledge')
const payPledgePaypal = require('../lib/payments/paypal/payPledge')
const debug = require('debug')('crowdfundings:webhooks:all')

const getWebhookHandler = require('../lib/payments/stripe/webhookHandler')
const {
  forUpdate,
  changeStatus,
  afterChange,
} = require('../lib/payments/Pledge')

const { STRIPE_TEST_MODE } = process.env

module.exports = async (server, pgdb, t, redis, connectionContext) => {
  const handleWebhook = await getWebhookHandler({
    pgdb,
    t,
    redis,
    connectionContext,
  })
  const context = {
    ...connectionContext,
    t,
  }

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
      pspPayload: body,
    })

    let code
    try {
      code = await handleWebhook({
        req,
        connected,
      })
    } catch (e) {
      req.log.error(
        { error: e },
        '[Pledge Payments] error processing stripe webhook ',
      )
      code = 500
    }
    return res.sendStatus(code)
  }

  // https://stripe.com/docs/webhooks
  server.post(
    '/payments/stripe',
    bodyParser.raw({ type: '*/*' }),
    async (req, res) => {
      return handleStripeWebhook(req, res, false)
    },
  )

  server.post(
    '/payments/stripe/connected',
    bodyParser.raw({ type: '*/*' }),
    async (req, res) => {
      return handleStripeWebhook(req, res, true)
    },
  )

  // https://e-payment-postfinance.v-psp.com/de/guides/integration%20guides/e-commerce/transaction-feedback#servertoserver-feedback
  server.get('/payments/pf', async (req, res) => {
    const { query: body } = req
    debug('pf %O', body)

    await pgdb.public.paymentsLog.insert({
      method: 'POSTFINANCECARD',
      pspPayload: body,
    })

    // end connection
    res.sendStatus(200)

    // payPledge in case that didn't happen already:
    // in case users close the paypal tab before being redirected back to us,
    // we only get notified about the payment via this webhook.
    // accepted status see: packages/republik-crowdfundings/lib/payments/postfinance/payPledge.js
    const status = parseInt(body.STATUS)
    if (status !== 9 && status !== 91) {
      return
    }

    const pledgeId = body.orderID
    const { updatedPledge } = await forUpdate({
      pledgeId,
      pgdb,
      fn: async ({ pledge, transaction }) => {
        if (pledge && pledge.status !== 'SUCCESSFUL') {
          debug('pf run payPledgePF via webhook')

          const pspPayload = {
            ...body,
          }
          const newStatus = await payPledgePF({
            pledgeId: pledge.id,
            total: pledge.total,
            pspPayload,
            userId: pledge.userId,
            transaction,
            t,
            logger,
          })
          if (pledge.status !== newStatus) {
            return {
              updatedPledge: await changeStatus(
                {
                  pledge,
                  newStatus,
                  transaction,
                },
                context,
              ),
            }
          }
        }
        return { updatedPledge: null }
      },
    })

    if (updatedPledge) {
      await afterChange(
        {
          pledge: updatedPledge,
        },
        context,
      )
    }
  })

  // https://developer.paypal.com/docs/integration/direct/webhooks/rest-webhooks/
  server.post(
    '/payments/paypal',
    bodyParser.urlencoded({ extended: true }),
    async (req, res) => {
      const { body } = req
      await pgdb.public.paymentsLog.insert({
        method: 'PAYPAL',
        pspPayload: body,
      })

      // end connection
      res.sendStatus(200)

      // payPledge in case that didn't happen already:
      // in case users close the paypal tab before being redirected back to us,
      // we only get notified about the payment via this webhook.
      // we ignore non Completed status changes for now
      if (body.payment_status === 'Completed') {
        const pledgeId = body.item_name

        const { updatedPledge } = await forUpdate({
          pledgeId,
          pgdb,
          fn: async ({ pledge, transaction }) => {
            if (pledge && pledge.status !== 'SUCCESSFUL') {
              const pspPayload = {
                ...body,
                tx: body.txn_id, // normalize with redirect params
                webhook: true,
              }
              const newStatus = await payPledgePaypal({
                pledgeId: pledge.id,
                total: pledge.total,
                pspPayload,
                transaction,
                t,
                logger,
              })
              if (pledge.status !== newStatus) {
                return {
                  updatedPledge: await changeStatus(
                    {
                      pledge,
                      newStatus,
                      transaction,
                    },
                    context,
                  ),
                }
              }
            }
            return { updatedPledge: null }
          },
        })

        if (updatedPledge) {
          await afterChange(
            {
              pledge: updatedPledge,
            },
            context,
          )
        }
      }
    },
  )

  return server
}
