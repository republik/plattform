import { User } from '@orbiting/backend-modules-types'

import {
  MemberStatus,
  UserInterests,
  AudienceSubscriptionResult,
  MemberData,
  assertEnvVariableExists,
} from '../types'

const MailchimpInterface = require('../index')

export type AddUserToAudienceParams = {
  user: User
  audienceId: string
  interests: UserInterests
  statusIfNew: MemberStatus
  defaultStatus: MemberStatus
}

const {
  MAILCHIMP_MARKETING_AUDIENCE_ID,
  MAILCHIMP_MARKETING_INTEREST_FREE_OFFERS_ONLY,
} = process.env

export async function addUserToAudience({
  user,
  audienceId,
  interests = {},
  statusIfNew = MailchimpInterface.MemberStatus.Subscribed,
  defaultStatus = MailchimpInterface.MemberStatus.Unsubscribed,
}: AddUserToAudienceParams): Promise<AudienceSubscriptionResult> {
  const { email } = user

  if (!audienceId) {
    console.error('AudienceId is not defined')
  }

  const data: MemberData = {
    email_address: email,
    status_if_new: statusIfNew,
    status: defaultStatus,
    interests,
  }

  const mailchimp = MailchimpInterface({ console })
  await mailchimp.updateMember(email, data, audienceId)

  const result: AudienceSubscriptionResult = {
    user,
    interests,
    status_if_new: statusIfNew,
    status: defaultStatus,
  }

  return result
}

export async function addUserToMarketingAudience(user: User) {
  const interest: UserInterests = {}

  assertEnvVariableExists(MAILCHIMP_MARKETING_AUDIENCE_ID)
  assertEnvVariableExists(MAILCHIMP_MARKETING_INTEREST_FREE_OFFERS_ONLY)
  interest[MAILCHIMP_MARKETING_INTEREST_FREE_OFFERS_ONLY] = true

  return addUserToAudience({
    user: user,
    audienceId: MAILCHIMP_MARKETING_AUDIENCE_ID,
    interests: interest,
    statusIfNew: MailchimpInterface.MemberStatus.Subscribed,
    defaultStatus: MailchimpInterface.MemberStatus.Subscribed,
  })
}
