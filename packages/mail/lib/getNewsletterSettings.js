const NewsletterSubscription = require('../NewsletterSubscription')
const MailchimpInterface = require('../MailchimpInterface')
const logger = console

module.exports = async (user) => {
  const { email, roles } = user

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
        status === 'subscribed' ? member.interests[interestId] : false,
        roles
      ))
    }
  })
  return { status, subscriptions }
}
