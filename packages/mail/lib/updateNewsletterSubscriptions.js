const MailchimpInterface = require('../MailchimpInterface')
const NewsletterSubscription = require('../NewsletterSubscription')
const logger = console

module.exports = async ({ user, interests }) => {
  const { email, roles } = user

  const mailchimp = new MailchimpInterface({ logger })
  await mailchimp.updateMember(email, {
    email_address: email,
    status: 'subscribed',
    interests
  })

  return Object.keys(interests)
    .map(interestId => new NewsletterSubscription(user.id, interestId, interests[interestId], roles))
}
