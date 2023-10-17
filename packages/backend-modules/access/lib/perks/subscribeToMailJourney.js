const debug = require('debug')('access:lib:perks:subscribeToMailJourney')

const { MAILCHIMP_PROBELESEN_AUDIENCE_ID } = process.env

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
  const audienceId = MAILCHIMP_PROBELESEN_AUDIENCE_ID

  await mail.addUserToAudience({
    user: recipient,
    audienceId: audienceId,
  })

  debug('give', {
    recipient: recipient.id,
    audience: audienceId,
  })

  return {
    recipient: recipient.id,
    subscribedAudience: audienceId,
    eventLogExtend: `.${audienceId}`, // eventlog bei audience subscription drin lassen oder rausnehmen? wenn drin, dann überall
  }
}

const revoke = async () => {
  // unsubscribe should happen automatically
  return {}
}

module.exports = { give, revoke }
