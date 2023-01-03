/**

{
  "perks": [
    {
      "subscribeNewsletter": {
        "name": "CLIMATE"
      }
    }
  ]
}

*/

const debug = require('debug')('access:lib:perks:subscribeNewsletter')

const {
  Consents: { saveConsents },
} = require('@orbiting/backend-modules-auth')

const give = async (
  campaign,
  grant,
  recipient,
  settings,
  t,
  pgdb,
  redis,
  mail,
) => {
  const { name } = settings

  await saveConsents({
    userId: recipient.id,
    consents: [name],
    req: { ip: '123.123.123.123' }, // @TODO
    pgdb,
  })

  await mail.updateNewsletterSubscription({
    user: recipient,
    name,
    subscribed: true,
  })

  debug('give', {
    recipient: recipient.id,
    subscribedNewsletter: name, // @TODO
    // addedRole: settings.role,
  })

  return {
    recipient: recipient.id,
    // addedRole: settings.role,
    subscribedNewsltter: name, // TODO
    eventLogExtend: `.${name}`,
  }
}

const revoke = async (grant, recipient, settings, pgdb) => {
  // nothing to revoke

  return {}
}

module.exports = { give, revoke }
