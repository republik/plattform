import { SegmentData, UserInterests } from '../types'
import { getConfig } from '../config'
import { UserRow } from '@orbiting/backend-modules-types'

const {
  MAILCHIMP_INTEREST_PLEDGE,
  MAILCHIMP_INTEREST_MEMBER,
  MAILCHIMP_INTEREST_MEMBER_BENEFACTOR,
  MAILCHIMP_INTEREST_GRANTED_ACCESS,
  MAILCHIMP_INTEREST_NEWSLETTER_DAILY,
  MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY,
  MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR,
} = getConfig()

type GetInterestsForUserParams = {
  user: UserRow
  subscribeToEditorialNewsletters?: boolean
  segmentData: SegmentData
}

export async function getInterestsForUser({
  user,
  subscribeToEditorialNewsletters,
  segmentData,
}: GetInterestsForUserParams): Promise<UserInterests> {
  const userId = user.id

  const hasPledge = !!segmentData.pledges && segmentData.pledges.length > 0

  const hasMembership = !!userId && !!segmentData.activeMembership

  const isBenefactor = !!userId && !!segmentData.benefactorMembership

  const hasGrantedAccess =
    !!user && !!segmentData.accessGrants && segmentData.accessGrants.length > 0

  const interests = { ...segmentData.newsletterInterests }

  // Update the membership type interests on mailchimp
  interests[MAILCHIMP_INTEREST_PLEDGE] = hasPledge
  interests[MAILCHIMP_INTEREST_MEMBER] = hasMembership
  interests[MAILCHIMP_INTEREST_MEMBER_BENEFACTOR] = isBenefactor
  interests[MAILCHIMP_INTEREST_GRANTED_ACCESS] = hasGrantedAccess

  if (subscribeToEditorialNewsletters && (hasMembership || hasGrantedAccess)) {
    // Autosubscribe all newsletters when new user just paid the membersh.
    interests[MAILCHIMP_INTEREST_NEWSLETTER_DAILY] = true
    interests[MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY] = true
    interests[MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR] = true
  }

  return interests
}
