import { mergeFieldNames } from "./lib/getMergeFieldsForUser"
import MailchimpInterface from "./MailchimpInterface"

export type UserInterests = {
  [x: string]: boolean
}

export type MemberStatus = typeof MailchimpInterface.MemberStatus[keyof typeof MailchimpInterface.MemberStatus]

export type MergeFieldName = typeof mergeFieldNames[keyof typeof mergeFieldNames]

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

export type Membership = {
  id: string,
  userId: string,
  pledgeId: string,
  membershipTypeId: string,
  membershipTypeName: 'ABO' | 'MONTHLY_ABO' | 'BENEFACTOR_ABO' | 'YEARLY_ABO' | 'ABO_GIVE_MONTHS',
  createdAt: Date,
  active: boolean,
  renew: boolean,
  autoPay: boolean,
  initialInterval: 'year' | 'month' | 'week' | 'day',
}

type MembershipPeriod = {
  id: string,
  membershipId: string,
  beginDate: Date,
  endDate: Date,
  pledgeId: string
}

type AccessGrant = {
  id: string,
  granterUserId: string,
  email: string,
  recipientUserId: string | null,
  beginAt: Date,
  endAt: Date,
  revokedAt: Date | null,
  invalidatedAt: Date | null,
  payload: object,
}

export type SegmentData = {
  pledges: Pledge[] | undefined,
  activeMembership: Membership | undefined,
  activeMembershipPeriod: MembershipPeriod | undefined,
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
