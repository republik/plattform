import Nullable from '../../../../lib/types/Nullable'

export type DiscussionNotificationChannel = 'WEB' | 'EMAIL' | 'APP'

export type DiscussionNotificationOption = 'MY_CHILDREN' | 'ALL' | 'NONE'

export type DateTime = string

type DiscussionAnonymity = 'ALLOWED' | 'ENFORCED' | 'FORBIDDEN'

export type DiscussionCredential = {
  id: string
  description: string
  verified: boolean
  isListed: boolean
}

export type DiscussionRules = {
  maxLength: Nullable<number>
  anonymity: DiscussionAnonymity
  disableTopLevelComments: Nullable<boolean>
}

export type DiscussionPreferences = {
  anonymity: boolean
  credential: Nullable<DiscussionCredential>
  notifications: Nullable<DiscussionNotificationOption>
}
