import MailchimpInterface from '../MailchimpInterface'
import { SubscriptionHandlerMissingMailError } from './errors'

export async function updateNewsletterSubscriptions(
  { user, interests = {}, mergeFields = {}, name, subscribed },
  NewsletterSubscription,
) {
  if (!NewsletterSubscription) throw new SubscriptionHandlerMissingMailError()

  // single subscription update
  if (!Object.keys(interests).length && !!name) {
    const interestId = NewsletterSubscription.interestIdByName(name)
    interests[interestId] = subscribed
  }

  const { email, roles } = user

  const body: any = {
    email_address: email,
    status_if_new: MailchimpInterface.MemberStatus.Subscribed,
    interests,
    merge_fields: {
      ...mergeFields,
    },
  }

  const mailchimp = MailchimpInterface({ console })
  const member = await mailchimp.getMember(email)
  if (
    member &&
    member.status !== MailchimpInterface.MemberStatus.Unsubscribed
  ) {
    // if a user is unsubscribed we don't update a status, if archived and resubscribes to newsletters we do
    body.status = MailchimpInterface.MemberStatus.Subscribed
  }

  console.log('--------updateNewsletterSubscription %s', JSON.stringify(mergeFields))

  await mailchimp.updateMember(email, body)

  // user might be null if using with just {email, roles}
  const subscriptions = user &&
  user.id &&
  Object.keys(interests).map((interestId) => {
    return NewsletterSubscription.buildSubscription(
      user.id,
      interestId,
      interests[interestId],
      roles,
    )
  }).filter((subscription) => !!subscription)
  return subscriptions
}
