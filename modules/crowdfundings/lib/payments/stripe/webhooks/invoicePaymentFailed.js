const { sendMailTemplate } = require('@orbiting/backend-modules-mail')
const _ = {
  get: require('lodash/get')
}

// stripe tried to charge the card but this failed
module.exports = {
  eventTypes: ['invoice.payment_failed'],
  handle: async (event, pgdb, t) => {
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
        subject: t('api/email/subscription/payment/failed/subject'),
        templateName: 'subscription_failed',
        globalMergeVars: [
          { name: 'NAME',
            content: [user.firstName, user.lastName]
            .filter(Boolean)
            .join(' ')
          }
        ]
      })
    }
  }
}
