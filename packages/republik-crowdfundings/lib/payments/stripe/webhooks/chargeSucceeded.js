const debug = require('debug')('crowdfundings:webhooks:stripe')
const _ = {
  get: require('lodash/get')
}

// charge.succeeded contains all the charge details
// but not the pledgeId
// if this event arrives before invoice.payment_succeeded
// we reject it and wait for the webhook to fire again
module.exports = {
  eventTypes: ['charge.succeeded'],
  handle: async (event, pgdb, t) => {
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
  }
}
