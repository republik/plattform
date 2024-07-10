import MailchimpInterface from "./MailchimpInterface"

export type UserInterests = {
  [x: string]: boolean
}

export type MemberStatus = typeof MailchimpInterface.MemberStatus[keyof typeof MailchimpInterface.MemberStatus]

export type MemberData = {
  email_address: string,
  status_if_new: MemberStatus,
  status: MemberStatus
  interests: UserInterests,
}
