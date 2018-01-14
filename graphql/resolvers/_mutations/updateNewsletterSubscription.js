const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const updateNewsletterSubscription = require('../../../lib/mailchimp/updateNewsletterSubscription')

module.exports = async (_, args, context) => {
  const { req, user } = context
  ensureSignedIn(req)
  const { name, subscribed, status } = args

  return updateNewsletterSubscription(
    {
      userId: user.id,
      name,
      subscribed,
      status
    },
    context
  )
}
