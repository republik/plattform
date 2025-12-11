import MailchimpInterface from '../../MailchimpInterface'
const debug = require('debug')('mail:lib:scheduler:archive')
const checkEnv = require('check-env')
const bluebird = require('bluebird')

export async function archiveUnsubscribed(dryRun: boolean) {
  // get all unsubscribed from mailchimp onboarding audience and set to archived
  debug('archive unsubscribed from onboarding scheduler')
  checkEnv([
    'MAILCHIMP_ONBOARDING_AUDIENCE_ID',
    'MAILCHIMP_MARKETING_AUDIENCE_ID',
    'MAILCHIMP_PROBELESEN_AUDIENCE_ID',
    'MAILCHIMP_REGWALL_TRIAL_AUDIENCE_ID',
    'MAILCHIMP_PRODUKTINFOS_AUDIENCE_ID'
  ])
  const {
    MAILCHIMP_ONBOARDING_AUDIENCE_ID,
    MAILCHIMP_MARKETING_AUDIENCE_ID,
    MAILCHIMP_PROBELESEN_AUDIENCE_ID,
    MAILCHIMP_PRODUKTINFOS_AUDIENCE_ID,
    MAILCHIMP_REGWALL_TRIAL_AUDIENCE_ID
  } = process.env

  const audiencesToArchiveUnsubscribed = [
    MAILCHIMP_ONBOARDING_AUDIENCE_ID,
    MAILCHIMP_MARKETING_AUDIENCE_ID,
    MAILCHIMP_PROBELESEN_AUDIENCE_ID,
    MAILCHIMP_REGWALL_TRIAL_AUDIENCE_ID,
    MAILCHIMP_PRODUKTINFOS_AUDIENCE_ID
  ]

  bluebird.each(audiencesToArchiveUnsubscribed, async (audienceId: string) =>
    archiveUnsubscribedInAudience({ dryRun, audienceId }),
  )
}

const archiveUnsubscribedInAudience = async ({
  dryRun,
  audienceId,
}: {
  dryRun: boolean
  audienceId: string
}) => {
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
    (member: any) => member.email_address,
  )
  debug(emailsToArchive)

  const results: boolean[] = []

  if (dryRun) {
    console.log(
      `in dry-run mode, not actually archiving any emails. Emails to archive: ${emailsToArchive.join(
        ', ',
      )}`,
    )
  }

  bluebird.each(emailsToArchive, async (email: string) => {
    if (dryRun) {
      results.push(true)
    } else {
      const result = await mailchimp.archiveMember(email, audienceId)
      results.push(!!result)
    }
  })
  return results
}
