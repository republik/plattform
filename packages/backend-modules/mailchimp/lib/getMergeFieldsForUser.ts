import { UserRow } from '@orbiting/backend-modules-types'
import { getConsentLink } from '@orbiting/backend-modules-republik/lib/Newsletter'
import { MergeFieldName, SegmentData } from '../types'

type GetMergeFieldsForUserParams = { user: UserRow; segmentData: SegmentData }
type SubscriptionState = 'Cancelled' | 'Autopay' | 'Active' | undefined
type TrialState = 'Active' | 'Past' | undefined
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
  trialState: 'TRIAL',
} as const

export async function getMergeFieldsForUser({
  user,
  segmentData,
}: GetMergeFieldsForUserParams): Promise<UserMergeFields> {
  
  const latestMembershipPledgeAmount = getLatestMembershipPledgeAmount(segmentData)
  const subscriptionState = getSubscriptionState(segmentData)
  const linkCa = getConsentLink(user.email, 'CLIMATE')
  const linkWdwww = getConsentLink(user.email, 'WDWWW')
  const trialState = getTrialState(segmentData)

  return {
    [mergeFieldNames.firstName]: user.firstName,
    [mergeFieldNames.lastName]: user.lastName,
    [mergeFieldNames.latestPledgeAmount]: latestMembershipPledgeAmount,
    [mergeFieldNames.subscriptionEndDate]: segmentData.activeMembershipPeriod?.endDate,
    [mergeFieldNames.subscriptionType]: segmentData.activeMembership?.membershipTypeName,
    [mergeFieldNames.subscriptionState]: subscriptionState,
    [mergeFieldNames.newsletterOptInCa]: linkCa,
    [mergeFieldNames.newsletterOptInWb]: linkWdwww,
    [mergeFieldNames.trialState]: trialState,
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
  if (!segmentData.activeMembership) {
    return undefined
  }
  const { activeMembership } = segmentData
  // Cancelled: Monatsabonnent*innen, die auf ein Jahresabo gewechselt haben, das aber noch nicht gestartet ist, fallen auch unter cancelled
  if (!activeMembership.renew) {
    return 'Cancelled'
  }
  if (activeMembership.autoPay) {
    return 'Autopay'
  }
  return 'Active'
}

function getTrialState(segmentData: SegmentData): TrialState {
  const now = new Date()
  const activeAccessGrants = segmentData.accessGrants?.filter(
    (ag) => ag.beginAt <= now && ag.endAt > now && !ag.invalidatedAt,
  )
  const hasActiveGrantedAccess = !!activeAccessGrants && activeAccessGrants.length > 0
  if (hasActiveGrantedAccess) {
    return 'Active'
  }
  if (segmentData.accessGrants?.length) {
    return 'Past'
  }
}
