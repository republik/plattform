const { Roles } = require('@orbiting/backend-modules-auth')

const {
  cache: { create },
} = require('@orbiting/backend-modules-utils')

const QUERY_CACHE_TTL_SECONDS = 60 // One minute

const createResubscribeEmailCacheFn = (userId, context) => {
  return create(
    {
      namespace: 'republik',
      prefix: 'mail:resubscribeEmail',
      key: userId,
      ttl: QUERY_CACHE_TTL_SECONDS,
    },
    context,
  )
}

module.exports = async (_, args, context) => {
  const { userId } = args
  const {
    user: me,
    pgdb,
    t,
    mail: { getNewsletterSettings, resubscribeEmail },
  } = context

  const user = userId ? await pgdb.public.users.findOne({ id: userId }) : me

  if (!user) {
    context.logger.error({ userId }, 'user not found')
    throw new Error(t('api/users/404'))
  }

  Roles.ensureUserIsMeOrInRoles(user, me, ['supporter'])

  await resubscribeEmail(user, createResubscribeEmailCacheFn, context)

  try {
    return getNewsletterSettings({ user })
  } catch (error) {
    context.logger.error({ error }, 'getNewsletterProfile failed')
    // console.error('getNewsletterProfile failed', { error })
    throw new Error(t('api/newsletters/get/failed'))
  }
}
