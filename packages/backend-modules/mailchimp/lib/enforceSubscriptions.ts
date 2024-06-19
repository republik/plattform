import type { PgDb } from 'pogi'
import { getInterestsForUser } from './getInterestsForUser'

import {
  assertEnvVariableExists,
} from '../types'
import { addUserToAudience, addUserToMarketingAudience } from './addUserToAudience'
import { archiveMemberInAudience } from './archiveMemberInAudience'
import { updateNewsletterSubscriptions } from './updateNewsletterSubscriptions'
import { NewsletterSubcsriptionConfig } from '@orbiting/backend-modules-republik-crowdfundings/lib/Mail'

const MailchimpInterface = require('../index')

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
} = process.env

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

  assertEnvVariableExists(MAILCHIMP_INTEREST_MEMBER)
  assertEnvVariableExists(MAILCHIMP_INTEREST_MEMBER_BENEFACTOR)
  assertEnvVariableExists(MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR)
  assertEnvVariableExists(MAILCHIMP_INTEREST_NEWSLETTER_CLIMATE)
  assertEnvVariableExists(MAILCHIMP_INTEREST_NEWSLETTER_WDWWW)
  assertEnvVariableExists(MAILCHIMP_PRODUKTINFOS_AUDIENCE_ID)
  assertEnvVariableExists(MAILCHIMP_MAIN_LIST_ID)
  assertEnvVariableExists(MAILCHIMP_MARKETING_AUDIENCE_ID)
  assertEnvVariableExists(MAILCHIMP_PROBELESEN_AUDIENCE_ID)
  assertEnvVariableExists(MAILCHIMP_ONBOARDING_AUDIENCE_ID)

  const interests = await getInterestsForUser({
    userId: !!user && user.id,
    subscribeToEditorialNewsletters,
    pgdb,
  })

  const hasActiveMembership =
    interests[MAILCHIMP_INTEREST_MEMBER] ||
    interests[MAILCHIMP_INTEREST_MEMBER_BENEFACTOR]

  const subscribedToFreeNewsletters =
    interests[MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR] ||
    interests[MAILCHIMP_INTEREST_NEWSLETTER_CLIMATE] ||
    interests[MAILCHIMP_INTEREST_NEWSLETTER_WDWWW]

  const newsletterSubscriptions = await updateNewsletterSubscriptions({
    user: user || { email },
    interests,
    name,
    subscribed,
  }, NewsletterSubcsriptionConfig)
  const allSubscriptions = [
    {
      audienceId: MAILCHIMP_MAIN_LIST_ID,
      subscriptions: newsletterSubscriptions,
    },
  ]

  // always add to marketing audience when newsletter settings are updated, except if MEMBER or BENEFACTOR are true
  if (!hasActiveMembership) {
    const marketingSubscription = await addUserToMarketingAudience(user || { email })
    allSubscriptions.push({
      audienceId: MAILCHIMP_MARKETING_AUDIENCE_ID,
      subscriptions: marketingSubscription,
    })

    archiveMemberInAudience({
      user: user || { email },
      audienceId: MAILCHIMP_PRODUKTINFOS_AUDIENCE_ID,
    })

    if (!subscribedToFreeNewsletters) {
      archiveMemberInAudience({
        user: user || { email },
        audienceId: MAILCHIMP_MAIN_LIST_ID,
      })
    }
  } else {
    // user has an active subscription/membership
    archiveMemberInAudience({
      user: user || { email },
      audienceId: MAILCHIMP_MARKETING_AUDIENCE_ID,
    })

    const produktinfosSubscription = await addUserToAudience({
      user: user || { email },
      audienceId: MAILCHIMP_PRODUKTINFOS_AUDIENCE_ID,
      interests: {},
      statusIfNew: MailchimpInterface.MemberStatus.Subscribed,
      defaultStatus: MailchimpInterface.MemberStatus.Subscribed,
    })
    allSubscriptions.push({
      audienceId: MAILCHIMP_PRODUKTINFOS_AUDIENCE_ID,
      subscriptions: produktinfosSubscription,
    })

    archiveMemberInAudience({
      user: user || { email },
      audienceId: MAILCHIMP_PROBELESEN_AUDIENCE_ID,
    })
  }

  if (subscribeToOnboardingMails) {
    const onboardingSubscription = await addUserToAudience({
      user: user || { email },
      audienceId: MAILCHIMP_ONBOARDING_AUDIENCE_ID,
      interests: {},
      statusIfNew: MailchimpInterface.MemberStatus.Subscribed,
      defaultStatus: MailchimpInterface.MemberStatus.Subscribed,
    })

    allSubscriptions.push({
      audienceId: MAILCHIMP_ONBOARDING_AUDIENCE_ID,
      subscriptions: onboardingSubscription,
    })
  }

  return allSubscriptions
}
