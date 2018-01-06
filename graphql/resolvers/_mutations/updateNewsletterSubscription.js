const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const logger = console
const updateNewsletterSubscription = require('../../../lib/mailchimp/updateNewsletterSubscription')

module.exports = async (_, args, { pgdb, req, user, t }) => {
  ensureSignedIn(req, t)
  const { name, subscribed } = args

  if (!user) {
    logger.error('user not found', { req: req._log() })
    throw new Error(t('api/users/404'))
  }

  return updateNewsletterSubscription({
    pgdb,
    userId: user.id,
    email: user.email,
    name,
    subscribed,
    roles: user.roles
  })
}
