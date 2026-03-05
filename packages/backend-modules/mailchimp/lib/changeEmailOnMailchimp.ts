import { User } from '@orbiting/backend-modules-types'
import MailchimpInterface from '../MailchimpInterface'
import { EmailRequiredMailError } from './errors'
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

  await Promise.allSettled(
    MailchimpInterface.audiences.map(async (audienceId) => {
      const oldUser = await mailchimp.getMember(oldEmail, audienceId)
      if (oldUser) {
        return mailchimp.updateMember(
          oldEmail,
          {
            email_address: newEmail,
          },
          audienceId,
        )
      }
    }),
  )
}
