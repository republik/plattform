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

type Pledge = {
  id: string,
  packageId: string,
  userId: string,
  status: 'SUCCESSFUL' | 'DRAFT' | 'WAITING_FOR_PAYMENT' | 'PAID_INVESTIGATE' | 'CANCELLED',
  total: number,
  donation: number,
  createdAt: Date,
  payload: object,
}

type Membership = {
  id: string,
  userId: string,
  pledgeId: string,
  membershipTypeId: string,
  createdAt: Date,
  active: boolean,
  renew: boolean,
  autoPay: boolean,
  initialInterval: 'year' | 'month' | 'week' | 'day',
  succeedingMembershipId: string
}

type AccessGrant = {
  id: string,
  granterUserId: string,
  email: string,
  recipientUserId: string,
  beginAt: Date,
  endAt: Date,
  revokedAt: Date,
  invalidatedAt: Date,
  payload: object,
}

export type SegmentData = {
  pledges: Pledge[] | undefined,
  activeMembership: Membership | undefined,
  benefactorMembership: Membership | undefined,
  accessGrants: AccessGrant[] | undefined,
  newsletterInterests: UserInterests | undefined,
}

export type MailchimpContact = {
  id: string,
  email_address: string,
  status: MemberStatus,
  merge_fields: object,
  interests: UserInterests,
}
