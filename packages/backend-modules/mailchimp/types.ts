

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
