import { User } from '@orbiting/backend-modules-types'
import MailchimpInterface from '../MailchimpInterface'
import { SubscriptionHandlerMissingMailError } from './errors'
import { mergeFieldNames } from './getMergeFieldsForUser'
import { NewsletterSubscriptionInterface } from '../NewsletterSubscription'

type UpdateNewsletterSubsciptionsParams = {
  user: User
  interests: any
  mergeFields: any
  name?: string
  subscribed?: boolean
  status: any
}

export async function updateNewsletterSubscriptions(
  {
    user,
    interests = {},
    mergeFields = {},
    name,
    subscribed,
    status,
  }: UpdateNewsletterSubsciptionsParams,
  NewsletterSubscription: NewsletterSubscriptionInterface,
) {
  if (!NewsletterSubscription) throw new SubscriptionHandlerMissingMailError()

  // single subscription update
  if (!Object.keys(interests).length && !!name) {
    const interestId = NewsletterSubscription.interestIdByName(name)
    interests[interestId] = subscribed
    mergeFields[mergeFieldNames[interestId]] = subscribed
      ? 'Subscribed'
      : 'Unsubscribed'
  }

  const { email, roles } = user

  Object.keys(interests).forEach((interestId) => {
    mergeFields[mergeFieldNames[interestId]] = interests[interestId]
      ? 'Subscribed'
      : 'Unsubscribed'
  })

  const body: any = {
    email_address: email,
    status_if_new: MailchimpInterface.MemberStatus.Subscribed,
    interests,
    merge_fields: {
      ...mergeFields,
    },
  }

  const mailchimp = MailchimpInterface({ console })

  let mailchimpStatus
  if (!status) {
    const member = await mailchimp.getMember(email)
    mailchimpStatus = member?.status
  } else {
    mailchimpStatus = status
  }

  if (
    mailchimpStatus &&
    mailchimpStatus !== MailchimpInterface.MemberStatus.Unsubscribed
  ) {
    // if a user is unsubscribed we don't update a status, if archived and resubscribes to newsletters we do
    body.status = MailchimpInterface.MemberStatus.Subscribed
  }

  await mailchimp.updateMember(email, body)

  // user might be null if using with just {email, roles}
  const subscriptions =
    user &&
    user.id &&
    Object.keys(interests)
      .map((interestId) => {
        return NewsletterSubscription.buildSubscription(
          user.id,
          interestId,
          interests[interestId],
          roles,
        )
      })
      .filter((subscription) => !!subscription)
  return subscriptions
}
