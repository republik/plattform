const {
  Roles,
  Users: {
    upsertUserAndConsents
  }
} = require('@orbiting/backend-modules-auth')
const { authenticate } = require('../../../lib/Newsletter')
const base64u = require('@orbiting/backend-modules-base64u')

module.exports = async (_, args, context) => {
  const {
    userId,
    name,
    subscribed,
    email: _email,
    mac,
    consents: _consents
  } = args

  // email might be base64u
  const email = _email && base64u.match(_email)
    ? base64u.decode(_email)
    : _email

  // only allow PRIVACY consent via this endpint
  const consents = _consents && _consents.filter(c => c === 'PRIVACY')

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
  // if email and mac is set and correct, the user is upserted (used for newsletter signup)
  let user
  if (_email) {
    if (mac && mac === authenticate(email, name, subscribed, t)) {
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

    if (!user) {
      console.error('user not found', { req: req._log() })
      throw new Error(t('api/users/404'))
    }

    Roles.ensureUserIsMeOrInRoles(user, me, ['supporter'])
  }

  try {
    return updateNewsletterSubscription(
      {
        user,
        name,
        subscribed
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
