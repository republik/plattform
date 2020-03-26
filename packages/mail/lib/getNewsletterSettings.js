const MailchimpInterface = require('../MailchimpInterface')
const { SubscriptionHandlerMissingMailError } = require('../errors')
const logger = console

module.exports = async ({
  user
}, NewsletterSubscription) => {
  // circumvent circle dependency
  const { Roles: { userIsInRoles } } = require('@orbiting/backend-modules-auth')

  const { email, roles } = user
  if (!NewsletterSubscription) throw new SubscriptionHandlerMissingMailError()

  const supportedInterestConfigs = NewsletterSubscription
    .allInterestConfigurations()

  const mailchimp = MailchimpInterface({ logger })
  const member = await mailchimp.getMember(email)

  if (!member) {
    // member could not be retrieved
    // return all possible interests / subscriptions
    const status = ''
    const subscriptions = supportedInterestConfigs
      .filter(({ visibleToRoles }) => !visibleToRoles || !visibleToRoles.length)
      .map(({ interestId }) => NewsletterSubscription.buildSubscription(
        user.id,
        interestId,
        false,
        roles
      ))
    return { status, subscriptions }
  }

  const status = member.status
  const subscriptions = []
  supportedInterestConfigs.forEach(({ interestId, visibleToRoles }) => {
    // only return visible interests
    if (!visibleToRoles || !visibleToRoles.length || userIsInRoles(user, visibleToRoles)) {
      subscriptions.push(NewsletterSubscription.buildSubscription(
        user.id,
        interestId,
        status === MailchimpInterface.MemberStatus.Subscribed ? (member.interests[interestId] || false) : false,
        roles
      ))
    }
  })
  return { status, subscriptions }
}
