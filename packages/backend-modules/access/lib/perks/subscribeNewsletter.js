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
    consents: [`NEWSLETTER_${name}`],
    req: {}, // ip is not needed to save consent, but req must not be undefined
    pgdb,
  })

  await mail.updateNewsletterSubscriptions({
    user: recipient,
    name,
    subscribed: true,
  })

  debug('give', {
    recipient: recipient.id,
    subscribedNewsletter: name,
  })

  return {
    recipient: recipient.id,
    subscribedNewsletter: name,
    eventLogExtend: `.${name}`,
  }
}

const revoke = async () => {
  // nothing to revoke
  return {}
}

module.exports = { give, revoke }
