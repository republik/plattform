const debug = require('debug')('crowdfundings:webhooks:stripe')
const getStripeClients = require('./clients')
const { sendMailTemplate } = require('@orbiting/backend-modules-mail')
const _ = {
  get: require('lodash/get')
}

module.exports = async ({ pgdb, t }) => {
  const {
    platform,
    connectedAccounts
  } = await getStripeClients(pgdb)

  const typesOfIntereset = [
    'invoice.payment_succeeded',
    'invoice.payment_failed',
    'charge.succeeded',
    'charge.refunded',
    'customer.subscription.deleted',
    'customer.subscription.updated'
  ]

  return async ({
    req,
    connected = false
  }) => {
    // check event
    let event
    try {
      // all events for connected accounts share the same secret
      const account = connected
        ? connectedAccounts[0]
        : platform

      event = account.stripe.webhooks.constructEvent(
        req.body,
        req.headers['stripe-signature'],
        account.endpointSecret
      )
    } catch (e) {
      console.error(e)
      return 400
    }

    if (typesOfIntereset.indexOf(event.type) > -1) {
      debug('%O', event)

      /*
      const account = event.accountId
        ? accounts.find( a => a.accountId === event.account )
        : platform
      if (!account) {
        throw new Error("stripe handleWebhook didn't find local account for event")
      }
      */

      // invoice.payment_succeeded includes:
      // pledgeId, charge total and charge id
      // but not the charge details, charge may not
      // exist at the time this hook is received
      if (event.type === 'invoice.payment_succeeded') {
        const invoice = _.get(event, 'data.object')
        const subscription = _.get(event, 'data.object.lines.data[0]')
        if (subscription.type === 'subscription') {
          const {
            charge: chargeId,
            total
          } = invoice
          const pledgeId = subscription.metadata.pledgeId

          const transaction = await pgdb.transactionBegin()
          try {
            // synchronize with payPledge
            const pledge = await transaction.query(`
              SELECT *
              FROM pledges
              WHERE id = :pledgeId
              FOR UPDATE
            `, {
              pledgeId
            })
              .then(response => response[0])
              .catch(e => {
                console.error(e)
                return null
              })

            if (!pledge) {
              console.warn(`received webhook for unknown pledgeId ${pledgeId}`)
              await transaction.transactionRollback()
              return 500
            }

            const existingPayments = await transaction.public.payments.find({
              method: 'STRIPE',
              pspId: chargeId
            })

            if (!existingPayments.length) {
              // the first membershipPeriod was already inserted by generateMemberships
              // but not the corresponding payment, save that here
              const payment = await transaction.public.payments.insertAndGet({
                type: 'PLEDGE',
                method: 'STRIPE',
                total: total,
                status: 'PAID',
                pspId: chargeId
              })

              await transaction.public.pledgePayments.insert({
                pledgeId,
                paymentId: payment.id,
                paymentType: 'PLEDGE'
              })
            }

            const memberships = await transaction.public.memberships.find({
              pledgeId
            })
            const firstNotification = await transaction.query(`
              SELECT
                DISTINCT(m.id)
              FROM
                "membershipPeriods" mp
              JOIN
                memberships m
                ON mp."membershipId" = m.id
              JOIN
                pledges p
                ON m."pledgeId" = p.id
              WHERE
                mp."webhookEventId" IS NOT NULL AND
                p.id = :pledgeId
            `, {
              pledgeId
            })
              .then(response => !response.length)
              .catch(e => {
                console.error(e)
                return null
              })

            const beginDate = new Date(subscription.period.start * 1000)
            const endDate = new Date(subscription.period.end * 1000)
            if (firstNotification) {
              // synchronize beginDate and endDate with stripe
              await transaction.query(`
                UPDATE "membershipPeriods" mp
                SET
                  "webhookEventId" = :webhookEventId,
                  "beginDate" = :beginDate,
                  "endDate" = :endDate,
                  "updatedAt" = :now
                WHERE
                  ARRAY[mp."membershipId"] && :membershipIds AND
                  mp."webhookEventId" is null
              `, {
                membershipIds: memberships.map(m => m.id),
                webhookEventId: event.id,
                beginDate,
                endDate,
                now: new Date()
              })
            } else {
              // check for duplicate event
              if (!(await transaction.public.membershipPeriods.findFirst({ webhookEventId: event.id }))) {
                // insert membershipPeriods
                await Promise.all(memberships.map(membership => {
                  return transaction.public.membershipPeriods.insert({
                    membershipId: membership.id,
                    beginDate,
                    endDate,
                    webhookEventId: event.id
                  })
                }))
                await transaction.public.memberships.update({
                  id: memberships.map(m => m.id)
                }, {
                  active: true,
                  updatedAt: new Date()
                })
              }
            }
            await transaction.transactionCommit()
          } catch (e) {
            await transaction.transactionRollback()
            console.info('transaction rollback', { error: e })
            console.error(e)
            throw e
          }
        }
      // stripe tried to charge the card but this failed
      } else if (event.type === 'invoice.payment_failed') {
        const subscription = _.get(event, 'data.object.lines.data[0]')
        if (subscription.type === 'subscription') {
          const pledgeId = subscription.metadata.pledgeId
          const user = await pgdb.query(`
            SELECT u.*
            FROM users u
            JOIN pledges p
            ON u.id = p."userId" AND
            p.id = :pledgeId
          `, {
            pledgeId
          })
            .then(response => response[0])
            .catch(e => {
              console.error(e)
              return null
            })

          if (!user) {
            throw new Error('user for invoice.payment_failed event not found! subscriptionId:' + subscription.id)
          }

          await sendMailTemplate({
            to: user.email,
            subject: t('api/email/payment/subscription/failed/subject'),
            templateName: 'subscription_failed',
            globalMergeVars: [
              { name: 'NAME',
                content: user.name
              }
            ]
          })
        }
      // charge.succeeded contains all the charge details
      // but not the pledgeId
      // if this event arrives before invoice.payment_succeeded
      // we reject it and wait for the webhook to fire again
      } else if (event.type === 'charge.succeeded') {
        const charge = _.get(event, 'data.object')
        const transaction = await pgdb.transactionBegin()
        try {
          const existingPayment = await transaction.query(`
            SELECT *
            FROM payments
            WHERE "pspId" = :pspId
            FOR UPDATE
          `, {
            pspId: charge.id
          })
            .then(response => response[0])
            .catch(e => {
              console.error(e)
              return null
            })

          if (existingPayment) {
            await transaction.public.payments.update({
              id: existingPayment.id
            }, {
              pspPayload: charge,
              updatedAt: new Date()
            })
          } else {
            debug('no existing payment found in charge.succeeded. rejecting event %O', event)
            await transaction.transactionRollback()
            return 503
          }

          await transaction.transactionCommit()
        } catch (e) {
          await transaction.transactionRollback()
          console.info('transaction rollback', { error: e })
          console.error(e)
          throw e
        }
      } else if (event.type === 'charge.refunded') {
        const charge = _.get(event, 'data.object')
        const transaction = await pgdb.transactionBegin()
        try {
          const existingPayment = await transaction.query(`
            SELECT *
            FROM payments
            WHERE "pspId" = :pspId
            FOR UPDATE
          `, {
            pspId: charge.id
          })
            .then(response => response[0])
            .catch(e => {
              console.error(e)
              return null
            })

          if (existingPayment) {
            await transaction.public.payments.update({
              id: existingPayment.id
            }, {
              status: 'REFUNDED',
              updatedAt: new Date()
            })
          } else {
            debug('no existing payment found in charge.refunded. rejecting event %O', event)
            await transaction.transactionRollback()
            return 503
          }

          await transaction.transactionCommit()
        } catch (e) {
          await transaction.transactionRollback()
          console.info('transaction rollback', { error: e })
          console.error(e)
          throw e
        }
      } else if (event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object
        const pledgeId = subscription.metadata.pledgeId

        const transaction = await pgdb.transactionBegin()
        try {
          const pledge = await transaction.query(`
            SELECT *
            FROM pledges
            WHERE id = :pledgeId
            FOR UPDATE
          `, {
            pledgeId
          })
            .then(response => response[0])
            .catch(e => {
              console.error(e)
              return null
            })

          if (!pledge) {
            throw new Error('pledge for customer.subscription event not found! subscriptionId:' + subscription.id)
          }

          const memberships = await transaction.public.memberships.find({
            pledgeId
          })
          if (!memberships.length) {
            throw new Error('pledge for customer.subscription event has no memberships! subscriptionId:' + subscription.id)
          }

          // Possible values are trialing, active, past_due, canceled, or unpaid
          // https://stripe.com/docs/api/node#subscription_object
          if (subscription.status === 'canceled') {
            await transaction.public.memberships.update({
              pledgeId
            }, {
              renew: false,
              updatedAt: new Date()
            })
          } else if (subscription.status === 'unpaid') {
            // we might ignore this event and do it in a local cron
            await transaction.public.memberships.update({
              pledgeId
            }, {
              active: false,
              updatedAt: new Date()
            })
          }
          await transaction.transactionCommit()
        } catch (e) {
          await transaction.transactionRollback()
          console.info('transaction rollback', { error: e })
          console.error(e)
          throw e
        }
      } else {
        throw new Error('missing handler for event type: ' + event.type)
      }
    } else {
      debug(`webhookHandler ignoring event with type: ${event.type}`)
    }
    return 200
  }
}
