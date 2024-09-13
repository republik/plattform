import MailchimpInterface from '../MailchimpInterface'
import { MailchimpContact } from '../types'

export async function getMailchimpMember(
  email: string,
): Promise<MailchimpContact | null> {
  const mailchimp = MailchimpInterface({ console })
  return mailchimp.getMember(email)
}
