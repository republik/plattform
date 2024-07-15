import { UserRow } from '@orbiting/backend-modules-types'
import { getConsentLink } from '@orbiting/backend-modules-republik/lib/Newsletter'
import { MergeFieldName, SegmentData } from '../types'

type GetMergeFieldsForUserParams = { user: UserRow; segmentData: SegmentData }
type SubscriptionState = 'Cancelled' | 'Autopay' | 'Active' | undefined
type UserMergeFields = Partial<Record<MergeFieldName, string | number | Date>>

export const mergeFieldNames = {
  firstName: 'FNAME',
  lastName: 'LNAME',
  latestPledgeAmount: 'PL_AMOUNT',
  subscriptionEndDate: 'END_DATE',
  subscriptionType: 'SUB_TYPE',
  subscriptionState: 'SUB_STATE',
  newsletterOptInCa: 'NL_LINK_CA',
  newsletterOptInWb: 'NL_LINK_WD',
} as const

export function getMergeFieldsForUser({
  user,
  segmentData,
}: GetMergeFieldsForUserParams): UserMergeFields {
  
  const latestMembershipPledgeAmount = getLatestMembershipPledgeAmount(segmentData)
  const subscriptionState = getSubscriptionState(segmentData)
  const linkCa = getConsentLink(user.email, 'CLIMATE')
  const linkWdwww = getConsentLink(user.email, 'WDWWW')

  return {
    [mergeFieldNames.firstName]: user.firstName,
    [mergeFieldNames.lastName]: user.lastName,
    [mergeFieldNames.latestPledgeAmount]: latestMembershipPledgeAmount,
    [mergeFieldNames.subscriptionEndDate]: segmentData.activeMembershipPeriod?.endDate,
    [mergeFieldNames.subscriptionType]: segmentData.activeMembership?.membershipTypeName,
    [mergeFieldNames.subscriptionState]: subscriptionState,
    [mergeFieldNames.newsletterOptInCa]: linkCa,
    [mergeFieldNames.newsletterOptInWb]: linkWdwww,
  }
}

function getLatestMembershipPledgeAmount(segmentData: SegmentData): number {
  const latestMembershipPledgeId = segmentData.activeMembershipPeriod?.pledgeId
  const filteredPledges = segmentData.pledges?.filter(
    (pledge) => pledge.id === latestMembershipPledgeId,
  )
  return filteredPledges?.length === 1 ? filteredPledges[0].total / 100 : 0
}

function getSubscriptionState(segmentData: SegmentData): SubscriptionState {
  const { activeMembership } = segmentData
  // Cancelled: Monatsabonnent*innen, die auf ein Jahresabo gewechselt haben, das aber noch nicht gestartet ist, fallen auch unter cancelled
  if (!activeMembership?.renew) {
    return 'Cancelled'
  }
  if (activeMembership.autoPay) {
    return 'Autopay'
  }
  return 'Active'
}
