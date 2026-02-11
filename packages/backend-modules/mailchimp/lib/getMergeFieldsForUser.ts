import { getConsentLink } from '@orbiting/backend-modules-republik/lib/Newsletter'
import {
  MembershipType,
  MergeFieldName,
  SegmentData,
  SubscriptionType,
  UserInterests,
} from '../types'
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
  MAILCHIMP_INTEREST_NEWSLETTER_SUNDAY,
  MAILCHIMP_INTEREST_NEWSLETTER_BAB,
  REGWALL_TRIAL_CAMPAIGN_ID,
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
  regwallTrialState: 'REG_TRIAL',
  specialOffer: 'DISCOUNT',
  [MAILCHIMP_INTEREST_NEWSLETTER_DAILY]: 'NL_DAILY',
  [MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY]: 'NL_WEEKLY',
  [MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR]: 'NL_PROJ_R',
  [MAILCHIMP_INTEREST_NEWSLETTER_CLIMATE]: 'NL_CLIMATE',
  [MAILCHIMP_INTEREST_NEWSLETTER_WDWWW]: 'NL_WDWWW',
  [MAILCHIMP_INTEREST_NEWSLETTER_ACCOMPLICE]: 'NL_ACCOMPL',
  [MAILCHIMP_INTEREST_NEWSLETTER_SUNDAY]: 'NL_SUNDAY',
  [MAILCHIMP_INTEREST_NEWSLETTER_BAB]: 'NL_BAB',
} as const

export async function getMergeFieldsForUser({
  user,
  segmentData,
}: GetMergeFieldsForUserParams): Promise<UserMergeFields> {
  const latestMembershipPledgeAmount =
    getLatestMembershipPledgeAmount(segmentData)
  const subscriptionEndDate = getSubscriptionEndDate(segmentData)
  const subscriptionType = getSubscriptionType(segmentData)
  const subscriptionState = getSubscriptionState(segmentData)
  const linkCa = user?.email && getConsentLink(user.email, 'CLIMATE')
  const linkWdwww = user?.email && getConsentLink(user.email, 'WDWWW')
  const trialState = getTrialState(segmentData)
  const regwallTrialState = getRegwallTrialState(segmentData)
  const specialOffer = segmentData.activeSubscription?.metadata?.discountName

  const newsletterInterests = segmentData.mailchimpMember?.interests

  return {
    [mergeFieldNames.firstName]: user?.firstName,
    [mergeFieldNames.lastName]: user?.lastName,
    [mergeFieldNames.latestPledgeAmount]: latestMembershipPledgeAmount,
    [mergeFieldNames.subscriptionEndDate]: subscriptionEndDate,
    [mergeFieldNames.subscriptionType]: subscriptionType,
    [mergeFieldNames.subscriptionState]: subscriptionState,
    [mergeFieldNames.newsletterOptInCa]: linkCa,
    [mergeFieldNames.newsletterOptInWb]: linkWdwww,
    [mergeFieldNames.trialState]: trialState,
    [mergeFieldNames.regwallTrialState]: regwallTrialState,
    [mergeFieldNames.specialOffer]: specialOffer,
    NL_DAILY: hasInterest(
      newsletterInterests,
      MAILCHIMP_INTEREST_NEWSLETTER_DAILY,
    ),
    NL_WEEKLY: hasInterest(
      newsletterInterests,
      MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY,
    ),
    NL_PROJ_R: hasInterest(
      newsletterInterests,
      MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR,
    ),
    NL_CLIMATE: hasInterest(
      newsletterInterests,
      MAILCHIMP_INTEREST_NEWSLETTER_CLIMATE,
    ),
    NL_WDWWW: hasInterest(
      newsletterInterests,
      MAILCHIMP_INTEREST_NEWSLETTER_WDWWW,
    ),
    NL_SUNDAY: hasInterest(
      newsletterInterests,
      MAILCHIMP_INTEREST_NEWSLETTER_SUNDAY,
    ),
    NL_BAB: hasInterest(newsletterInterests, MAILCHIMP_INTEREST_NEWSLETTER_BAB),
    NL_ACCOMPL: hasInterest(
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
  if (segmentData.invoices?.length) {
    const latestInvoice = segmentData.invoices.sort(
      (a, b) => b.createdAt.valueOf() - a.createdAt.valueOf(),
    )[0]
    return latestInvoice.total / 100
  }

  // only take pledges into account if there are no invoices with the new subscriptions
  if (segmentData.pledges?.length) {
    // latest pledge of active membership
    const latestMembershipPledgeId =
      segmentData.activeMembershipPeriod?.pledgeId
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

  // no pledges or invoices
  return 0
}

function getSubscriptionEndDate(segmentData: SegmentData): Date | undefined {
  if (segmentData.activeSubscription) {
    return segmentData.activeSubscription.currentPeriodEnd
  }
  if (segmentData.activeMembershipPeriod) {
    return segmentData.activeMembershipPeriod.endDate
  }
}

function getSubscriptionType(
  segmentData: SegmentData,
): MembershipType | SubscriptionType | undefined {
  if (segmentData.activeSubscription) {
    return segmentData.activeSubscription.type
  }
  if (segmentData.activeMembership) {
    return segmentData.activeMembership.membershipTypeName
  }
}

function getSubscriptionState(segmentData: SegmentData): SubscriptionState {
  if (segmentData.activeSubscription) {
    const { activeSubscription } = segmentData
    if (activeSubscription.cancelAt) {
      return 'Cancelled'
    }
    return 'Autopay'
  }

  if (segmentData.activeMembership) {
    const { activeMembership } = segmentData

    if (!activeMembership.renew) {
      // Monatsabos, die auf ein Jahresabo gewechselt haben, haben auch ein gecancelltes Abo, werden hier aber künstlich auf State 'Active' gesetzt
      if (
        activeMembership.membershipTypeName === 'MONTHLY_ABO' &&
        activeMembership.cancellationReason ===
          'Auto Cancellation (generateMemberships)'
      ) {
        return 'Autopay'
      }
      return 'Cancelled'
    }
    if (activeMembership.autoPay) {
      return 'Autopay'
    }
    return 'Active'
  }
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

function getRegwallTrialState(segmentData: SegmentData): TrialState {
  const now = new Date()
  const regwallAccessGrants = segmentData.accessGrants?.filter(
    (ag) => ag.accessCampaignId === REGWALL_TRIAL_CAMPAIGN_ID,
  )
  const activeRegwallAccessGrants = regwallAccessGrants?.filter(
    (ag) =>
      ag.beginAt <= now && ag.endAt > now && !ag.invalidatedAt && !ag.revokedAt,
  )
  const hasActiveRegwallTrial =
    !!activeRegwallAccessGrants && activeRegwallAccessGrants.length > 0
  if (hasActiveRegwallTrial) {
    return 'Active'
  }
  if (regwallAccessGrants?.length) {
    return 'Past'
  }
}
