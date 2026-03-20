import MailchimpInterface from '../MailchimpInterface'
import { EmailRequiredMailError } from './errors'
const logger = console

export async function mergeUsersOnMailchimp({
  sourceUserEmail,
  targetUserEmail,
}: {
  sourceUserEmail: string
  targetUserEmail: string
}) {
  if (!sourceUserEmail || !targetUserEmail) {
    throw new EmailRequiredMailError()
  }

  const mailchimp = MailchimpInterface({ logger })

  await Promise.allSettled(
    MailchimpInterface.audiences.map(async (audienceId) => {
      const oldUser = await mailchimp.getMember(sourceUserEmail, audienceId)

      if (oldUser) {
        await mailchimp.updateMember(
          targetUserEmail,
          {
            status: oldUser.status,
            interests: oldUser.interests,
            merge_fields: oldUser.merge_fields,
            tags: oldUser.tags,
          },
          audienceId,
        )

        await mailchimp.archiveMember(sourceUserEmail, audienceId)
      }
    }),
  )
}
