const MailchimpInterface = require('../MailchimpInterface')
const { SubscriptionHandlerMissingMailError } = require('../errors')
const logger = console

module.exports = async ({
  user
}, NewsletterSubscription) => {
  const { email, roles } = user
  if (!NewsletterSubscription) throw new SubscriptionHandlerMissingMailError()

  const supportedInterestIds = NewsletterSubscription
    .allInterestConfigurations()
    .map(({ interestId }) => interestId)

  const mailchimp = new MailchimpInterface({ logger })
  const member = await mailchimp.getMember(email)

  if (!member) {
    // member could not be retrieved
    // return all possible interests / subscriptions
    const status = ''
    const subscriptions = supportedInterestIds
      .map((interestId) => new NewsletterSubscription(
        user.id,
        interestId,
        false,
        roles
      ))
    return { status, subscriptions }
  }

  const status = member.status
  const subscriptions = []
  supportedInterestIds.forEach(interestId => {
    // only return already configured interests / subscriptions
    if (interestId in member.interests) {
      subscriptions.push(new NewsletterSubscription(
        user.id,
        interestId,
        status === MailchimpInterface.MemberStatus.Subscribed ? member.interests[interestId] : false,
        roles
      ))
    }
  })
  return { status, subscriptions }
}
