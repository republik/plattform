const {
  Roles,
  Users: {
    upsertUserAndConsents
  }
} = require('@orbiting/backend-modules-auth')
const { authenticate } = require('../../../lib/Newsletter')

module.exports = async (_, args, context) => {
  const {
    userId,
    name,
    subscribed,
    status,
    email,
    mac,
    consents
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

  // if userId is null, the logged in user's subscription is changed
  // if email and hmac is set, the user is upserted (used for newsletter signup)
  let user
  if (email) {
    if (mac === authenticate(email, name, subscribed, consents, t)) {
      ({ user } = await upsertUserAndConsents({
        pgdb,
        email,
        consents,
        req
      }))
    } else {
      throw new Error(t('api/newsletters/update/token/invalid'))
    }
  } else {
    user = userId
      ? await pgdb.public.users.findOne({ id: userId })
      : me
  }

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
