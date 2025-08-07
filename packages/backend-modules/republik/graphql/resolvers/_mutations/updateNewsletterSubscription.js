const validator = require('validator')

const {
  Roles,
  Users: { upsertUserAndConsents },
  Consents: { saveConsents, revokeConsent },
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
    consents: _consents = [],
  } = args

  // only allow PRIVACY consent via this endpint
  const consents = _consents.filter((c) => c === 'PRIVACY')

  const {
    user: me,
    pgdb,
    req,
    t,
    mail: { updateNewsletterSubscriptions, enforceSubscriptions },
  } = context

  // if userId is null, the logged in user's subscription is changed
  // if email and mac is set and correct, the user is upserted (used for newsletter signup)
  let user
  if (email) {
    if (!validator.isEmail(email)) {
      throw new Error(t('api/email/invalid'))
    }

    if (mac && mac === authenticate(email, name, subscribed, t)) {
      ;({ user } = await upsertUserAndConsents({
        pgdb,
        email,
        consents,
        req,
      }))
    } else {
      throw new Error(t('api/newsletters/update/token/invalid'))
    }
  } else {
    user = userId ? await pgdb.public.users.findOne({ id: userId }) : me

    if (!user) {
      context.logger.error({ userId }, 'user not found')
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
      consents: [consentName],
      req,
      pgdb,
    })
  } else {
    await revokeConsent(
      {
        userId: user.id,
        consent: consentName,
      },
      context,
    )
  }

  try {
    const subscriptions = await updateNewsletterSubscriptions(
      {
        user,
        interests: {},
        name,
        subscribed,
      },
      context,
    )

    // update audiences and merge fields
    await enforceSubscriptions({
      userId: user.id,
      email: user.email,
      subscribeToOnboardingMails: false,
      subscribeToEditorialNewsletters: false,
      pgdb,
      name,
      subscribed,
    })

    if (subscriptions.length) {
      return subscriptions[0]
    } else {
      throw new Error()
    }
  } catch (error) {
    console.error('updateNewsletterSubscription failed', error.meta)
    throw new Error(t('api/newsletters/update/failed'))
  }
}
