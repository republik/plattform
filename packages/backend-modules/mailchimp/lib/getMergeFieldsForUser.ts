import { getConsentLink } from '@orbiting/backend-modules-republik/lib/Newsletter'
import { MergeFieldName, SegmentData, UserInterests } from '../types'
import { getConfig } from '../config'

type User = { firstName: string; lastName: string; email: string }
type GetMergeFieldsForUserParams = { user: User; segmentData: SegmentData }
type SubscriptionState = 'Cancelled' | 'Autopay' | 'Active' | undefined
type TrialState = 'Active' | 'Past' | undefined
export type UserMergeFields = Record<
  MergeFieldName,
  string | number | Date | undefined
>

const {
  MAILCHIMP_INTEREST_NEWSLETTER_DAILY,
  MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY,
  MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR,
  MAILCHIMP_INTEREST_NEWSLETTER_CLIMATE,
  MAILCHIMP_INTEREST_NEWSLETTER_WDWWW,
  MAILCHIMP_INTEREST_NEWSLETTER_ACCOMPLICE,
} = getConfig()

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
  [MAILCHIMP_INTEREST_NEWSLETTER_DAILY]: 'NL_DAILY',
  [MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY]: 'NL_WEEKLY',
  [MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR]: 'NL_PROJ_R',
  [MAILCHIMP_INTEREST_NEWSLETTER_CLIMATE]: 'NL_CLIMATE',
  [MAILCHIMP_INTEREST_NEWSLETTER_WDWWW]: 'NL_WDWWW',
  [MAILCHIMP_INTEREST_NEWSLETTER_ACCOMPLICE]: 'NL_ACCOMPL',
} as const

export async function getMergeFieldsForUser({
  user,
  segmentData,
}: GetMergeFieldsForUserParams): Promise<UserMergeFields> {
  const latestMembershipPledgeAmount =
    getLatestMembershipPledgeAmount(segmentData)
  const subscriptionState = getSubscriptionState(segmentData)
  const linkCa = user?.email && getConsentLink(user.email, 'CLIMATE')
  const linkWdwww = user?.email && getConsentLink(user.email, 'WDWWW')
  const trialState = getTrialState(segmentData)

  const { activeMembershipPeriod, activeMembership, mailchimpMember } =
    segmentData

  const newsletterInterests = mailchimpMember?.interests

  return {
    [mergeFieldNames.firstName]: user?.firstName,
    [mergeFieldNames.lastName]: user?.lastName,
    [mergeFieldNames.latestPledgeAmount]: latestMembershipPledgeAmount,
    [mergeFieldNames.subscriptionEndDate]: activeMembershipPeriod?.endDate,
    [mergeFieldNames.subscriptionType]: activeMembership?.membershipTypeName,
    [mergeFieldNames.subscriptionState]: subscriptionState,
    [mergeFieldNames.newsletterOptInCa]: linkCa,
    [mergeFieldNames.newsletterOptInWb]: linkWdwww,
    [mergeFieldNames.trialState]: trialState,
    'NL_DAILY': hasInterest(
      newsletterInterests,
      MAILCHIMP_INTEREST_NEWSLETTER_DAILY,
    ),
    'NL_WEEKLY': hasInterest(
      newsletterInterests,
      MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY,
    ),
    'NL_PROJ_R': hasInterest(
      newsletterInterests,
      MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR,
    ),
    'NL_CLIMATE': hasInterest(
      newsletterInterests,
      MAILCHIMP_INTEREST_NEWSLETTER_CLIMATE,
    ),
    'NL_WDWWW': hasInterest(
      newsletterInterests,
      MAILCHIMP_INTEREST_NEWSLETTER_WDWWW,
    ),
    'NL_ACCOMPL': hasInterest(
      newsletterInterests,
      MAILCHIMP_INTEREST_NEWSLETTER_ACCOMPLICE,
    ),
  }
}

function hasInterest(
  userInterests: UserInterests | undefined,
  interestId: string,
): 'Subscribed' | 'Unsubscribed' | undefined {
  if (userInterests && userInterests[interestId]) {
    return 'Subscribed'
  }
}

function getLatestMembershipPledgeAmount(segmentData: SegmentData): number {
  // no pledges
  if (!segmentData.pledges?.length) {
    return 0
  }
  // latest pledge of active membership
  const latestMembershipPledgeId = segmentData.activeMembershipPeriod?.pledgeId
  const filteredPledges = segmentData.pledges.filter(
    (pledge) => pledge.id === latestMembershipPledgeId,
  )
  if (filteredPledges?.length === 1) {
    return filteredPledges[0].total / 100
  }
  // amount of any latest pledge
  const latestPledge = segmentData.pledges.sort(
    (a, b) => b.createdAt.valueOf() - a.createdAt.valueOf(),
  )[0]
  return latestPledge.total / 100
}

function getSubscriptionState(segmentData: SegmentData): SubscriptionState {
  if (!segmentData.activeMembership) {
    return undefined
  }
  const { activeMembership } = segmentData
 
  if (!activeMembership.renew) {
    // Monatsabos, die auf ein Jahresabo gewechselt haben, haben auch ein gecancelltes Abo, werden hier aber künstlich auf State 'Active' gesetzt
    if (activeMembership.membershipTypeName === 'MONTHLY_ABO' && activeMembership.cancellationReason === 'Auto Cancellation (generateMemberships)') {
      return 'Autopay'
    }
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
    (ag) =>
      ag.beginAt <= now && ag.endAt > now && !ag.invalidatedAt && !ag.revokedAt,
  )
  const hasActiveGrantedAccess =
    !!activeAccessGrants && activeAccessGrants.length > 0
  if (hasActiveGrantedAccess) {
    return 'Active'
  }
  if (segmentData.accessGrants?.length) {
    return 'Past'
  }
}