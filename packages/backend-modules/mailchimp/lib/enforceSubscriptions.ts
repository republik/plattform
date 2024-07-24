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
import { getNewsletterInterests } from './getNewsletterInterests'

const {
  MAILCHIMP_INTEREST_MEMBER,
  MAILCHIMP_INTEREST_MEMBER_BENEFACTOR,
  MAILCHIMP_MAIN_LIST_ID,
  MAILCHIMP_ONBOARDING_AUDIENCE_ID,
  MAILCHIMP_MARKETING_AUDIENCE_ID,
  MAILCHIMP_PROBELESEN_AUDIENCE_ID,
  MAILCHIMP_PRODUKTINFOS_AUDIENCE_ID,
  MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR,
  MAILCHIMP_INTEREST_NEWSLETTER_CLIMATE,
  MAILCHIMP_INTEREST_NEWSLETTER_WDWWW,
} = getConfig()

export type EnforceSubscriptionsParams = {
  userId: string
  email: string
  subscribeToOnboardingMails: boolean
  subscribeToEditorialNewsletters: boolean
  pgdb: PgDb
  name: string
  subscribed: boolean
}

export async function enforceSubscriptions({
  userId,
  email,
  subscribeToOnboardingMails,
  subscribeToEditorialNewsletters,
  pgdb,
  name,
  subscribed,
}: EnforceSubscriptionsParams) {
  const user = !!userId && (await pgdb.public.users.findOne({ id: userId }))

  const newsletterInterests = await getNewsletterInterests(user || { email })

  const segmentData = await getSegmentDataForUser({
    user,
    pgdb,
    newsletterInterests,
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

  const hasActiveMembership =
    interests[MAILCHIMP_INTEREST_MEMBER] ||
    interests[MAILCHIMP_INTEREST_MEMBER_BENEFACTOR]

  const subscribedToFreeNewsletters =
    interests[MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR] ||
    interests[MAILCHIMP_INTEREST_NEWSLETTER_CLIMATE] ||
    interests[MAILCHIMP_INTEREST_NEWSLETTER_WDWWW]

  const newsletterSubscription = createNewsletterSubscription(NewsletterSubscriptionConfig)

  await updateNewsletterSubscriptions({
    user: user || { email },
    interests,
    mergeFields,
    name,
    subscribed,
  }, newsletterSubscription)

  // always add to marketing audience when newsletter settings are updated, except if MEMBER or BENEFACTOR are true
  if (hasActiveMembership) {
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

    await archiveMemberInAudience({
      user: user || { email },
      audienceId: MAILCHIMP_PROBELESEN_AUDIENCE_ID,
    })
  } else {
    // no active membership
    await addUserToMarketingAudience(user || { email }, mergeFields)

    await archiveMemberInAudience({
      user: user || { email },
      audienceId: MAILCHIMP_PRODUKTINFOS_AUDIENCE_ID,
    })

    if (!subscribedToFreeNewsletters) {
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
