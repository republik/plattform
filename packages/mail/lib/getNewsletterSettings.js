const MailchimpInterface = require('../MailchimpInterface')
const { SubscriptionHandlerMissingMailError } = require('../errors')
const logger = console

module.exports = async ({ user }, NewsletterSubscription) => {
  // circumvent circle dependency
  const {
    Roles: { userIsInRoles },
  } = require('@orbiting/backend-modules-auth')

  if (!NewsletterSubscription) throw new SubscriptionHandlerMissingMailError()

  const { id, email, roles } = user
  const settingsId = Buffer.from(`${id}/NewsletterSettings`).toString('base64')

  const supportedInterestConfigs =
    NewsletterSubscription.allInterestConfigurations()

  const mailchimp = MailchimpInterface({ logger })
  const member = await mailchimp.getMember(email)

  if (!member) {
    // member could not be retrieved
    // return all possible interests / subscriptions
    const status = ''
    const subscriptions = supportedInterestConfigs
      .filter(({ visibleToRoles }) => !visibleToRoles || !visibleToRoles.length)
      .map(({ interestId }) =>
        NewsletterSubscription.buildSubscription(
          user.id,
          interestId,
          false,
          roles,
        ),
      )
    return { id: settingsId, status, subscriptions }
  }

  const status = member.status
  const subscriptions = []
  supportedInterestConfigs.forEach(({ interestId, visibleToRoles }) => {
    // only return visible interests
    if (
      !visibleToRoles ||
      !visibleToRoles.length ||
      userIsInRoles(user, visibleToRoles)
    ) {
      const subscribed = !!member.interests[interestId]
      subscriptions.push(
        NewsletterSubscription.buildSubscription(
          user.id,
          interestId,
          subscribed,
          roles,
        ),
      )
    }
  })
  return { id: settingsId, status, subscriptions }
}
