const { Roles } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, context) => {
  const {
    userId,
    name,
    subscribed,
    status
  } = args

  const {
    user: me,
    pgdb,
    req,
    t,
    mail: {
      updateNewsletterSubscription,
      errors
    }
  } = context

  const user = userId
    ? await pgdb.public.users.findOne({ id: userId })
    : me

  if (!user) {
    console.error('user not found', { req: req._log() })
    throw new Error(t('api/users/404'))
  }

  Roles.ensureUserIsMeOrInRoles(user, me, ['supporter'])

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
