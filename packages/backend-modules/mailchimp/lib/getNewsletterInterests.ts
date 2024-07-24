import MailchimpInterface from '../MailchimpInterface'

export async function getNewsletterInterests(email) {
  const mailchimp = MailchimpInterface({ console })
  const member = await mailchimp.getMember(email)
  return member?.interests
}
