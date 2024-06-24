import { User } from '@orbiting/backend-modules-types'
import { isUserInAudience } from './isUserInAudience'

const MailchimpInterface = require('../index')

export type ArchiveMemberInAudienceParams = {
  user: User,
  audienceId: string
}

export async function archiveMemberInAudience({ user, audienceId }: ArchiveMemberInAudienceParams) {
  const { email } = user
  if (!audienceId) {
    console.error('AudienceId is not defined')
  }
  const isAudienceMember = await isUserInAudience({
    user: user || { email },
    audienceId: audienceId,
  })
  if (isAudienceMember) {
    const mailchimp = MailchimpInterface({ console })
    const result = await mailchimp.archiveMember(email, audienceId)
    if (!result) {
      console.error(
        'Error while archiving user %s in audience id %s',
        email,
        audienceId,
      )
    }
  }
}
