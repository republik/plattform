const { NewsletterSubscription, supportedInterestIds } = require('./utils')
const MailchimpInterface = require('../MailchimpInterface')
const logger = console

module.exports = async (user) => {
  const { email, roles } = user
  const mailchimp = new MailchimpInterface({ logger })
  const member = await mailchimp.getMember(email)
  let interests, status
  if (!member) {
    status = ''
    interests = supportedInterestIds.reduce(
      (result, item) => {
        result[item] = false
        return result
      },
      {}
    )
  } else {
    status = member.status
    interests = member.interests
  }

  const subscriptions = []
  supportedInterestIds.forEach(interestId => {
    if (interestId in interests) {
      subscriptions.push(
        NewsletterSubscription(
          user.id,
          interestId,
          status !== 'subscribed' ? false : interests[interestId],
          roles
        )
      )
    }
  })
  return { status, subscriptions }
}
