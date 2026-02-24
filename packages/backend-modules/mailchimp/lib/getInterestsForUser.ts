import { SegmentData, UserInterests } from '../types'
import { getConfig } from '../config'

const {
  MAILCHIMP_INTEREST_PLEDGE,
  MAILCHIMP_INTEREST_MEMBER,
  MAILCHIMP_INTEREST_MEMBER_BENEFACTOR,
  MAILCHIMP_INTEREST_GRANTED_ACCESS,
  MAILCHIMP_INTEREST_PAST_REGWALL_TRIAL,
  MAILCHIMP_INTEREST_NEWSLETTER_DAILY,
  MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY,
  MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR,
  MAILCHIMP_INTEREST_NEWSLETTER_SUNDAY,
  MAILCHIMP_INTEREST_NEWSLETTER_BAB,
  REGWALL_TRIAL_CAMPAIGN_ID,
} = getConfig()

type User = { id: string; firstName?: string; lastName?: string; email: string }
type GetInterestsForUserParams = {
  user: User
  subscribeToEditorialNewsletters?: boolean
  segmentData: SegmentData
}

export async function getInterestsForUser({
  user,
  subscribeToEditorialNewsletters,
  segmentData,
}: GetInterestsForUserParams): Promise<UserInterests> {
  const userId = user.id

  const hasPledge = !!segmentData.pledges?.length
  const hasInvoice = !!segmentData.invoices?.length

  const hasMembership = !!userId && !!segmentData.activeMembership
  const hasSubscription = !!userId && !!segmentData.activeSubscription

  const isBenefactor =
    !!userId &&
    (!!segmentData.benefactorMembership ||
      segmentData.activeSubscription?.type === 'BENEFACTOR_SUBSCRIPTION')

  const now = new Date()
  const activeAccessGrants = segmentData.accessGrants?.filter(
    (ag) => ag.beginAt <= now && ag.endAt > now && !ag.invalidatedAt,
  )

  const hasActiveGrantedAccess = !!user && !!activeAccessGrants?.length

  const hasActiveOrPastRegwallTrial =
    !!user &&
    !!segmentData.accessGrants?.filter(
      (ag) => ag.accessCampaignId === REGWALL_TRIAL_CAMPAIGN_ID,
    ).length

  const interests = { ...segmentData.mailchimpMember?.interests }

  // Update the membership type interests on mailchimp
  interests[MAILCHIMP_INTEREST_PLEDGE] = hasPledge || hasInvoice
  interests[MAILCHIMP_INTEREST_MEMBER] = hasMembership || hasSubscription
  interests[MAILCHIMP_INTEREST_MEMBER_BENEFACTOR] = isBenefactor
  interests[MAILCHIMP_INTEREST_GRANTED_ACCESS] = hasActiveGrantedAccess
  interests[MAILCHIMP_INTEREST_PAST_REGWALL_TRIAL] = hasActiveOrPastRegwallTrial

  if (
    subscribeToEditorialNewsletters &&
    (hasMembership ||
      hasSubscription ||
      hasActiveGrantedAccess ||
      hasActiveOrPastRegwallTrial)
  ) {
    // Autosubscribe all newsletters when new user just paid the membersh.
    interests[MAILCHIMP_INTEREST_NEWSLETTER_DAILY] = true
    interests[MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY] = true
    interests[MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR] = true
    interests[MAILCHIMP_INTEREST_NEWSLETTER_SUNDAY] = true
    interests[MAILCHIMP_INTEREST_NEWSLETTER_BAB] = true
  }

  return interests
}
