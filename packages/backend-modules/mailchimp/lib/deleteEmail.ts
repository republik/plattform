import MailchimpInterface from '../MailchimpInterface'
import { EmailRequiredMailError } from './errors'
const logger = console

export async function deleteEmail({ email }) {
  if (!email) {
    throw new EmailRequiredMailError()
  }

  const mailchimp = MailchimpInterface({ logger })
  const deleted = MailchimpInterface.audiences.map((audienceId) => {
    return mailchimp.deleteMember(email, audienceId)
  })
  return deleted
}
