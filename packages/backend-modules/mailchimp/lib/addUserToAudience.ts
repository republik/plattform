import { User } from '@orbiting/backend-modules-types'

import { MemberStatus, UserInterests, MemberData } from '../types'

import { getConfig } from './../config'

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
} = getConfig()

export async function addUserToAudience({
  user,
  audienceId,
  interests = {},
  statusIfNew = MailchimpInterface.MemberStatus.Subscribed,
  defaultStatus = MailchimpInterface.MemberStatus.Unsubscribed,
}: AddUserToAudienceParams) {
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
}

export async function addUserToMarketingAudience(user: User) {
  const interest: UserInterests = {}

  interest[MAILCHIMP_MARKETING_INTEREST_FREE_OFFERS_ONLY] = true

  return addUserToAudience({
    user: user,
    audienceId: MAILCHIMP_MARKETING_AUDIENCE_ID,
    interests: interest,
    statusIfNew: MailchimpInterface.MemberStatus.Subscribed,
    defaultStatus: MailchimpInterface.MemberStatus.Subscribed,
  })
}
