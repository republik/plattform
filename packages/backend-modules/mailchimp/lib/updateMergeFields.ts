import MailchimpInterface from '../MailchimpInterface'
const logger = console

export async function updateMergeFields({ user }) {
  const { email, firstName, lastName } = user

  const body = {
    merge_fields: {
      FNAME: firstName || '',
      LNAME: lastName || '',
    },
  }

  const mailchimp = MailchimpInterface({ logger })
  await mailchimp.updateMember(email, body)
}
