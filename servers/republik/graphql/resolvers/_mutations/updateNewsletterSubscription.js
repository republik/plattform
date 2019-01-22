const {
  Roles,
  Users: {
    upsertUserAndConsents
  },
  Consents: {
    saveConsents,
    revokeConsent
  }
} = require('@orbiting/backend-modules-auth')
const { authenticate } = require('../../../lib/Newsletter')

// this endpoint is called for two distinct situations
// first: from the frontend and admin via userId, name, subscribed
// second: from as a newsletter subscription confirmation with email, mac, consents
module.exports = async (_, args, context) => {
  const {
    userId,
    name,
    subscribed,
    email,
    mac,
    consents: _consents = []
  } = args

  // only allow PRIVACY consent via this endpint
  const consents = _consents
    .filter(c => c === 'PRIVACY')

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
  if (email) {
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

  // calling this endpoint is an explicit consent
  // to get the desired newsletter
  const consentName = `NEWSLETTER_${name}`
  if (subscribed) {
    await saveConsents({
      userId: user.id,
      consents: [ consentName ],
      req,
      pgdb
    })
  } else {
    await revokeConsent(
      {
        userId: user.id,
        consent: consentName
      },
      context
    )
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
