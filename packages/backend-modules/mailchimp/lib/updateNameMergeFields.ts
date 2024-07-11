import { UserRow } from '@orbiting/backend-modules-types'
import MailchimpInterface from '../MailchimpInterface'
const logger = console

type UpdateNameMergeFieldsParams = {
  user: UserRow
}

export async function updateNameMergeFields({ user }: UpdateNameMergeFieldsParams) {
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
