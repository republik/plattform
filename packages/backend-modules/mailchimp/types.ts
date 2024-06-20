import { User } from '@orbiting/backend-modules-types'

export type AudienceSubscriptionResult = {
  user: User
  interests: UserInterests
  status_if_new: MemberStatus
  status: MemberStatus
}

export type UserInterests = {
  [x: string]: boolean
}

export type MemberStatus = {
  Subscribed: 'subscribed'
  Pending: 'pending'
  Unsubscribed: 'unsubscribed'
}

export type MemberData = {
  email_address: string,
  status_if_new: MemberStatus,
  status: MemberStatus
  interests: UserInterests,
}
