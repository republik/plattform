const debug = require('debug')('mail:lib:scheduler:onboarding')
const checkEnv = require('check-env')
const BluePromise = require('bluebird')
const MailchimpInterface = require('../../MailchimpInterface.js')

module.exports = async (dryRun = false) => {
  // get all unsubscribed from mailchimp onboarding audience and set to archived
  debug('archive unsubscribed from onboarding scheduler')
  checkEnv([
    'MAILCHIMP_ONBOARDING_AUDIENCE_ID',
    'MAILCHIMP_MARKETING_AUDIENCE_ID',
  ])
  const { MAILCHIMP_ONBOARDING_AUDIENCE_ID, MAILCHIMP_MARKETING_AUDIENCE_ID } =
    process.env

  const audiencesToArchiveUnsubscribed = [
    MAILCHIMP_ONBOARDING_AUDIENCE_ID,
    MAILCHIMP_MARKETING_AUDIENCE_ID,
  ]

  audiencesToArchiveUnsubscribed.forEach((audienceId) => {
    archiveUnsubscribed(dryRun, audienceId)
  })
}

const archiveUnsubscribed = async (dryRun = false, audienceId) => {
  const mailchimp = MailchimpInterface({ console })
  const unsubscribedMembers = await mailchimp.getMembersFromAudienceWithStatus(
    MailchimpInterface.MemberStatus.Unsubscribed,
    audienceId,
  )
  if (!unsubscribedMembers) {
    console.error(
      'Error while trying to retrieve unsubscribed members, not proceeding to archiving',
    )
  }
  const emailsToArchive = unsubscribedMembers.members.map(
    (member) => member.email_address,
  )
  debug(emailsToArchive)

  const results = []

  if (dryRun) {
    console.log(
      `in dry-run mode, not actually archiving any emails. Emails to archive: ${emailsToArchive.join(
        ', ',
      )}`,
    )
  }

  BluePromise.each(emailsToArchive, async (email) => {
    if (dryRun) {
      results.push(true)
    } else {
      const result = await mailchimp.archiveMember(email, audienceId)
      results.push(result)
    }
  })
  const successful = results.every((e) => e === true)
  debug(successful)
  if (!successful) {
    console.error(
      'Could not archive all unsubscribed emails from audience ' + audienceId,
    )
  }
}
