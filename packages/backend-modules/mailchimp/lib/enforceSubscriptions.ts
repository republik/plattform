import type { PgDb } from 'pogi'
import { getInterestsForUser } from './getInterestsForUser'

import {
  addUserToAudience,
  addUserToMarketingAudience,
} from './addUserToAudience'
import { archiveMemberInAudience } from './archiveMemberInAudience'
import { updateNewsletterSubscriptions } from './updateNewsletterSubscriptions'
import { getConfig } from '../config'
import { getSegmentDataForUser } from './getSegmentDataForUser'

import MailchimpInterface from '../MailchimpInterface'
import { NewsletterSubscriptionConfig } from '../NewsletterSubscriptionConfig'
import { createNewsletterSubscription } from '../NewsletterSubscription'
import { getMergeFieldsForUser } from './getMergeFieldsForUser'
import { getMailchimpMember } from './getMailchimpMember'

const {
  MAILCHIMP_INTEREST_MEMBER,
  MAILCHIMP_MAIN_LIST_ID,
  MAILCHIMP_ONBOARDING_AUDIENCE_ID,
  MAILCHIMP_MARKETING_AUDIENCE_ID,
  MAILCHIMP_PROBELESEN_AUDIENCE_ID,
  MAILCHIMP_PRODUKTINFOS_AUDIENCE_ID,
  MAILCHIMP_REGWALL_TRIAL_AUDIENCE_ID,
  MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR,
  MAILCHIMP_INTEREST_NEWSLETTER_CLIMATE,
  MAILCHIMP_INTEREST_NEWSLETTER_WDWWW,
  MAILCHIMP_INTEREST_NEWSLETTER_SUNDAY,
  MAILCHIMP_INTEREST_GRANTED_ACCESS,
  MAILCHIMP_INTEREST_PAST_REGWALL_TRIAL,
} = getConfig()

export type EnforceSubscriptionsParams = {
  userId: string
  email?: string
  subscribeToOnboardingMails?: boolean
  subscribeToEditorialNewsletters?: boolean
  pgdb: PgDb
  name?: string
  subscribed?: boolean
}

export async function enforceSubscriptions({
  userId,
  email,
  subscribeToOnboardingMails = false,
  subscribeToEditorialNewsletters = false,
  pgdb,
  name,
  subscribed,
}: EnforceSubscriptionsParams) {
  const user = !!userId && (await pgdb.public.users.findOne({ id: userId }))

  const mailchimpMember = await getMailchimpMember(user.email)

  const segmentData = await getSegmentDataForUser({
    user,
    pgdb,
    mailchimpMember,
  })

  const mergeFields = await getMergeFieldsForUser({
    user: user,
    segmentData,
  })

  const interests = await getInterestsForUser({
    user: user,
    subscribeToEditorialNewsletters,
    segmentData,
  })

  const hasMagazineAccess = interests[MAILCHIMP_INTEREST_MEMBER]

  const hasActiveTrial = interests[MAILCHIMP_INTEREST_GRANTED_ACCESS]

  const subscribedToFreeNewsletters =
    interests[MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR] ||
    interests[MAILCHIMP_INTEREST_NEWSLETTER_CLIMATE] ||
    interests[MAILCHIMP_INTEREST_NEWSLETTER_WDWWW] ||
    interests[MAILCHIMP_INTEREST_NEWSLETTER_SUNDAY]

  const activeOrPastRegwallTrial = interests[MAILCHIMP_INTEREST_PAST_REGWALL_TRIAL]

  const receivesEditorialNewsletters = activeOrPastRegwallTrial || subscribedToFreeNewsletters

  const newsletterSubscription = createNewsletterSubscription(
    NewsletterSubscriptionConfig,
  )

  await updateNewsletterSubscriptions(
    {
      user: user || { email },
      interests,
      mergeFields,
      name,
      subscribed,
      status: mailchimpMember?.status,
    },
    newsletterSubscription,
  )

  // always add to marketing audience when newsletter settings are updated, except if MEMBER
  // or if in active trial
  if (hasMagazineAccess) {
    await archiveMemberInAudience({
      user: user || { email },
      audienceId: MAILCHIMP_MARKETING_AUDIENCE_ID,
    })

    await addUserToAudience({
      user: user || { email },
      audienceId: MAILCHIMP_PRODUKTINFOS_AUDIENCE_ID,
      interests: {},
      mergeFields: mergeFields,
      statusIfNew: MailchimpInterface.MemberStatus.Subscribed,
      defaultStatus: MailchimpInterface.MemberStatus.Subscribed,
    })

    // archive in Probelesen Journey
    await archiveMemberInAudience({
      user: user || { email },
      audienceId: MAILCHIMP_PROBELESEN_AUDIENCE_ID,
    })

    // archive in Regwall Trial Journey
    await archiveMemberInAudience({
      user: user || { email },
      audienceId: MAILCHIMP_REGWALL_TRIAL_AUDIENCE_ID,
    })
  } else {
    // no active membership and no active trial
    if (!hasActiveTrial) {
      await addUserToMarketingAudience(user || { email }, mergeFields)
    }

    await archiveMemberInAudience({
      user: user || { email },
      audienceId: MAILCHIMP_PRODUKTINFOS_AUDIENCE_ID,
    })

    if (!receivesEditorialNewsletters && !hasActiveTrial) {
      await archiveMemberInAudience({
        user: user || { email },
        audienceId: MAILCHIMP_MAIN_LIST_ID,
      })
    }
  }

  if (subscribeToOnboardingMails) {
    await addUserToAudience({
      user: user || { email },
      audienceId: MAILCHIMP_ONBOARDING_AUDIENCE_ID,
      interests: {},
      statusIfNew: MailchimpInterface.MemberStatus.Subscribed,
      defaultStatus: MailchimpInterface.MemberStatus.Subscribed,
    })
  }
}
