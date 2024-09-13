import { User } from '@orbiting/backend-modules-types'
import MailchimpInterface from '../MailchimpInterface'
import { EmailRequiredMailError } from './errors'
import bluebird from 'bluebird'
const logger = console

export async function changeEmailOnMailchimp({
  user,
  newEmail,
}: {
  user: User
  newEmail: string
}) {
  const { email: oldEmail } = user
  if (!oldEmail || !newEmail) {
    throw new EmailRequiredMailError()
  }

  const mailchimp = MailchimpInterface({ logger })

  await bluebird.map(
    MailchimpInterface.audiences,
    async (audienceId) =>
      await moveSubscriptionsInAudience({
        mailchimp,
        oldEmail,
        newEmail,
        audienceId,
      }),
  )
}

const moveSubscriptionsInAudience = async ({
  mailchimp,
  oldEmail,
  newEmail,
  audienceId,
}: any) => {
  const member = await mailchimp.getMember(oldEmail, audienceId)

  if (member) {
    // archive oldEmail
    await mailchimp.archiveMember(oldEmail, audienceId)
    /*
  add new member with old members interests
  set status to unsubscribed if the old member status was unsubscribed or
  set it to subscribed in all other cases
  */
    return mailchimp.updateMember(
      newEmail,
      {
        email_address: newEmail,
        status_if_new: member.status,
        status: member.status,
        interests: member.interests,
        merge_fields: member.merge_fields,
        tags: member.tags,
      },
      audienceId,
    )
  }
}
