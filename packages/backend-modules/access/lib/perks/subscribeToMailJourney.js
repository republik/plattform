const debug = require('debug')('access:lib:perks:subscribeToMailJourney')

const {
  MAILCHIMP_PROBELESEN_AUDIENCE_ID,
  MAILCHIMP_REGWALL_TRIAL_AUDIENCE_ID,
} = process.env

const audiences = {
  REGWALL_TRIAL: MAILCHIMP_REGWALL_TRIAL_AUDIENCE_ID,
  PROBELESEN: MAILCHIMP_PROBELESEN_AUDIENCE_ID,
}

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
  // audienceId (direct Mailchimp audience id from campaign config) takes
  // precedence over the symbolic audience name mapped to env vars
  const audienceId = settings?.audienceId || audiences[settings?.audience]

  if (!audienceId) {
    throw new Error(
      `Error while subscribing user to mailchimp journey: provide settings.audienceId or settings.audience (REGWALL_TRIAL or PROBELESEN, requires the corresponding env var); got ${JSON.stringify(
        settings,
      )}`,
    )
  }

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
