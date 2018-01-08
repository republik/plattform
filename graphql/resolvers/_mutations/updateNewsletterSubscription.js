const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const updateNewsletterSubscription = require('../../../lib/mailchimp/updateNewsletterSubscription')

module.exports = async (_, args, context) => {
  const { req, t, user } = context
  ensureSignedIn(req, t)
  const { name, subscribed } = args

  return updateNewsletterSubscription(
    {
      userId: user.id,
      name,
      subscribed
    },
    context
  )
}
