const { ensureSignedIn, Roles } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, context) => {
  const { req, user, user: me, t, mail } = context
  const { updateNewsletterSubscription, errors } = mail
  ensureSignedIn(req)
  const { name, subscribed, status } = args
  Roles.ensureUserIsMeOrInRoles(user, me, ['supporter, admin'])

  try {
    return updateNewsletterSubscription(
      {
        user,
        name,
        subscribed,
        status
      },
      context
    )
  } catch (error) {
    if (error instanceof errors.InterestIdNotFoundMailError) {
      console.error('interestId not supported in updateNewsletterSubscription', error.meta)
      throw new Error(t('api/newsletters/update/interestIdNotSupported'))
    } else if (error instanceof errors.RolesNotEligibleMailError) {
      console.error('roles not eligible for interestId in updateNewsletterSubscription', error.meta)
      throw new Error(t('api/newsletters/update/rolesNotEligible'))
    } else {
      console.error('updateNewsletterSubscription failed', error.meta)
      throw new Error(t('api/newsletters/update/failed'))
    }
  }
}
