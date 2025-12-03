const { Roles } = require('@orbiting/backend-modules-auth')
const {transformUser} = require('@orbiting/backend-modules-auth')

const ALLOWED_ROLES = ['admin', 'supporter']

module.exports = async (_, args, context) => {
  const { user: me, t, loaders, pgdb } = context
  const { userId, onboardingDate } = args

  const user = await loaders.User.byId.load(userId)
  if (!user) {
    throw new Error(t('api/reportUser/userNotFound'))
  }

  Roles.ensureUserIsMeOrInRoles(user, me, ALLOWED_ROLES)

  const tx = await pgdb.transactionBegin()

  try {
    const updatedUser = await tx.public.users.updateAndGetOne({id: user.id}, {onboarded: onboardingDate})
    await tx.transactionCommit()

    return transformUser(updatedUser)

  } catch (e) {
    console.error('setOnboarded', e)
    await tx.transactionRollback()
    throw new Error(t('api/unexpected'))
  }
}
