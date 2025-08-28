import { mergeFieldNames, UserMergeFields } from './lib/getMergeFieldsForUser'
import MailchimpInterface from './MailchimpInterface'

export type UserInterests = {
  [x: string]: boolean
}

export type MemberStatus =
  (typeof MailchimpInterface.MemberStatus)[keyof typeof MailchimpInterface.MemberStatus]

export type MergeFieldName =
  (typeof mergeFieldNames)[keyof typeof mergeFieldNames]

export type MemberData = {
  email_address: string
  status_if_new: MemberStatus
  status: MemberStatus
  interests: UserInterests
  merge_fields: Partial<UserMergeFields>
}

type Pledge = {
  id: string
  packageId: string
  userId: string
  status:
    | 'SUCCESSFUL'
    | 'DRAFT'
    | 'WAITING_FOR_PAYMENT'
    | 'PAID_INVESTIGATE'
    | 'CANCELLED'
  total: number
  donation: number
  createdAt: Date
  payload: object
}

export type MembershipType =
  | 'ABO'
  | 'MONTHLY_ABO'
  | 'BENEFACTOR_ABO'
  | 'YEARLY_ABO'
  | 'ABO_GIVE_MONTHS'

export type Membership = {
  id: string
  userId: string
  pledgeId: string
  membershipTypeId: string
  membershipTypeName: MembershipType
  createdAt: Date
  active: boolean
  renew: boolean
  autoPay: boolean
  initialInterval: 'year' | 'month' | 'week' | 'day'
  cancellationReason?: string
}

type SubscriptionStatus =
  | 'trialing'
  | 'incomplete'
  | 'incomplete_expired'
  | 'paused'
  | 'active'
  | 'canceled'
  | 'unpaid'
  | 'past_due'
  | 'ended'

export const ACTIVE_STATUS_TYPES: SubscriptionStatus[] = [
  'active',
  'past_due',
  'unpaid',
  'paused',
]

export type SubscriptionType =
  | 'MONTHLY_SUBSCRIPTION'
  | 'BENEFACTOR_SUBSCRIPTION'
  | 'YEARLY_SUBSCRIPTION'

export type Subscription = {
  id: string
  userId: string
  type: SubscriptionType
  status: SubscriptionStatus
  metadata?: { discountName?: string }
  cancelAt: Date | undefined
  currentPeriodStart: Date
  currentPeriodEnd: Date
}

export type Invoice = {
  id: string
  userId: string
  subscriptionId: string
  total: number
  createdAt: Date
  periodStart: Date
  periodEnd: Date
}

type MembershipPeriod = {
  id: string
  membershipId: string
  beginDate: Date
  endDate: Date
  pledgeId: string
}

type AccessGrant = {
  id: string
  accessCampaignId: string
  granterUserId: string
  email: string
  recipientUserId: string | null
  beginAt: Date
  endAt: Date
  revokedAt: Date | null
  invalidatedAt: Date | null
  payload: object
}

export type SegmentData = {
  pledges: Pledge[] | undefined
  invoices: Invoice[] | undefined
  activeSubscription: Subscription | undefined
  activeMembership: Membership | undefined
  activeMembershipPeriod: MembershipPeriod | undefined
  benefactorMembership: Membership | undefined
  accessGrants: AccessGrant[] | undefined
  mailchimpMember: MailchimpContact | undefined | null
}

export type MailchimpContact = {
  id: string
  email_address: string
  status: MemberStatus
  merge_fields: object
  interests: UserInterests
}
