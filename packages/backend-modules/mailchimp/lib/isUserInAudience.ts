import MailchimpInterface from '../MailchimpInterface'

import { User } from '@orbiting/backend-modules-types'

export type IsUserInAudienceParams = {
  user: User,
  audienceId: string
}

export async function isUserInAudience({ user, audienceId }: IsUserInAudienceParams): Promise<boolean> {
  const mailchimp = MailchimpInterface({ console })
  const member = await mailchimp.getMember(user.email, audienceId)
  const notArchived = (member?.status !== MailchimpInterface.MemberStatus.Archived)
  return !!member && notArchived
}
