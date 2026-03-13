const { z } = require('zod')
const { t } = require('@orbiting/backend-modules-translate')

const {
  Roles,
  Users: { upsertUserAndConsents },
  Consents: { saveConsents, revokeConsent },
} = require('@orbiting/backend-modules-auth')

const { authenticate } = require('../../../lib/Newsletter')
const {
  getNewsletterSubscriptionConfig,
} = require('@orbiting/backend-modules-mailchimp')
const {
  confirmNewsletterSignupRequest,
  trackNewsletterSignup,
  refToUUID,
} = require('@orbiting/backend-modules-lead-tracking')

const { MAILCHIMP_NEWSLETTER_CONFIGS } = getNewsletterSubscriptionConfig()

const ArgsSchema = z.object({
  userId: z.string().uuid(),
  name: z.enum(MAILCHIMP_NEWSLETTER_CONFIGS.map((config) => config.name)),
  consents: z
    .array(z.string())
    .transform((arr) =>
      // only allow PRIVACY consent via this endpint
      arr.filter((item) => {
        return item === 'PRIVACY'
      }),
    )
    .optional(),
  subscribed: z.boolean(),
  email: z.string().email(t('api/email/invalid')).optional(),
  mac: z.string().optional(),
  ref: z.string().optional(),
})

// this endpoint is called for two distinct situations
// first: from the frontend and admin via userId, name, subscribed
// second: from as a newsletter subscription confirmation with email, mac, consents
module.exports = async (_, args, context) => {
  const result = ArgsSchema.safeParse(args)

  if (!result.success) {
    throw new Error(result.error.errors[0].message)
  }

  const { userId, name, subscribed, email, mac, ref, consents } = result.data

  const {
    user: me,
    pgdb,
    req,
    mail: { updateNewsletterSubscriptions, enforceSubscriptions },
  } = context

  // if userId is null, the logged in user's subscription is changed
  // if email and mac is set and correct, the user is upserted (used for newsletter signup)
  let user
  if (email) {
    if (!mac || mac !== authenticate(email, name, subscribed, t)) {
      throw new Error(t('api/newsletters/update/token/invalid'))
    }
    const { user: upsertedUser } = await upsertUserAndConsents({
      pgdb,
      email,
      consents,
      req,
    })
    user = upsertedUser
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

  let subscriptions
  try {
    const nlconfig = MAILCHIMP_NEWSLETTER_CONFIGS.find(
      (config) => config.name === name,
    )
    subscriptions = await updateNewsletterSubscriptions(
      {
        user,
        interests: {
          [nlconfig.interestId]: subscribed,
        },
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
    })
  } catch (error) {
    context.logger.error({ error }, 'updateNewsletterSubscription failed')
    throw new Error(t('api/newsletters/update/failed'))
  }

  if (subscribed) {
    if (ref) {
      try {
        await confirmNewsletterSignupRequest(pgdb, refToUUID(ref), user.id)
      } catch {
        // ref was invalid — track signup directly
        await trackNewsletterSignup(pgdb, user.id, name)
      }
    } else {
      await trackNewsletterSignup(pgdb, user.id, name)
    }
  }

  if (subscriptions.length) {
    return subscriptions[0]
  } else {
    throw new Error(t('api/newsletters/update/failed'))
  }
}
