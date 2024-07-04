import MailchimpInterface from '../MailchimpInterface'
import { SubscriptionHandlerMissingMailError } from './errors'
const logger = console

const updateNewsletterSubscriptions = async (
  { user, interests = {}, name, subscribed },
  NewsletterSubscription,
) => {
  if (!NewsletterSubscription) throw new SubscriptionHandlerMissingMailError()

  // single subscription update
  if (!Object.keys(interests).length && !!name) {
    const interestId = NewsletterSubscription.interestIdByName(name)
    interests[interestId] = subscribed
  }

  const { email, firstName, lastName, roles } = user

  const body: any = {
    email_address: email,
    status_if_new: MailchimpInterface.MemberStatus.Subscribed,
    interests,
    merge_fields: {
      FNAME: firstName || '',
      LNAME: lastName || '',
    },
  }

  const mailchimp = MailchimpInterface({ logger })
  const member = await mailchimp.getMember(email)
  if (
    member &&
    member.status !== MailchimpInterface.MemberStatus.Unsubscribed
  ) {
    // if a user is unsubscribed we don't update a status
    body.status = MailchimpInterface.MemberStatus.Subscribed
  }

  await mailchimp.updateMember(email, body)

  // user might be null if using with just {email, roles}
  return (
    user &&
    user.id &&
    Object.keys(interests).map((interestId) => {
      return NewsletterSubscription.buildSubscription(
        user.id,
        interestId,
        interests[interestId],
        roles,
      )
    })
  )
}

export { updateNewsletterSubscriptions }
