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
    req: { ip: null }, // TODO - not needed, could be empty object instead: req: {} or ip = null: req: { ip: null }
    pgdb,
  })

  await mail.updateNewsletterSubscription({
    user: recipient,
    name,
    subscribed: true,
  })

  debug('give', {
    recipient: recipient.id,
    subscribedNewsletter: name, // TODO
  })

  return {
    recipient: recipient.id,
    subscribedNewsltter: name, // TODO
    eventLogExtend: `.${name}`,
  }
}

const revoke = async () => {
  // nothing to revoke
  return {}
}

module.exports = { give, revoke }
