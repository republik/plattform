import MailchimpInterface from '../MailchimpInterface'
import { MailchimpContact } from '../types'

export async function getMailchimpMember(email): Promise<MailchimpContact | null> {
  const mailchimp = MailchimpInterface({ console })
  return mailchimp.getMember(email)
}
