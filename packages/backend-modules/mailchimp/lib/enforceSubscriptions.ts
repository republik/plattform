import type { PgDb } from 'pogi'
import { getInterestsForUser } from './getInterestsForUser'

import {
  addUserToAudience,
  addUserToMarketingAudience,
} from './addUserToAudience'
import { archiveMemberInAudience } from './archiveMemberInAudience'
import { updateNewsletterSubscriptions } from './updateNewsletterSubscriptions'
import { NewsletterSubscriptionConfig } from './../NewsletterSubscriptionConfig'
import { getConfig } from '../config'

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

  await updateNewsletterSubscriptions(
    {
      user: user || { email },
      interests,
      name,
      subscribed,
    },
    NewsletterSubscriptionConfig,
  )

  // always add to marketing audience when newsletter settings are updated, except if MEMBER or BENEFACTOR are true
  if (hasActiveMembership) {
    archiveMemberInAudience({
      user: user || { email },
      audienceId: MAILCHIMP_MARKETING_AUDIENCE_ID,
    })

    await addUserToAudience({
      user: user || { email },
      audienceId: MAILCHIMP_PRODUKTINFOS_AUDIENCE_ID,
      interests: {},
      statusIfNew: MailchimpInterface.MemberStatus.Subscribed,
      defaultStatus: MailchimpInterface.MemberStatus.Subscribed,
    })

    archiveMemberInAudience({
      user: user || { email },
      audienceId: MAILCHIMP_PROBELESEN_AUDIENCE_ID,
    })
  } else {
    // no active membership
    await addUserToMarketingAudience(user || { email })

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
