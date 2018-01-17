const { ensureSignedIn, Roles } = require('@orbiting/backend-modules-auth')
const { updateNewsletterSubscription } = require('@orbiting/backend-modules-mail')

module.exports = async (_, args, { user: me, ...context }) => {
  const { req, user } = context
  ensureSignedIn(req)
  const { name, subscribed, status } = args
  Roles.ensureUserIsMeOrInRoles(user, me, ['supporter, admin'])

  // TODO: Resolver level translation
  return updateNewsletterSubscription(
    {
      user,
      name,
      subscribed,
      status
    },
    context
  )
}
