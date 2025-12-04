const { transformUser } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, context) => {
  const { user: me, t, pgdb } = context

  const tx = await pgdb.transactionBegin()

  try {
    const updatedUser = await tx.public.users.updateAndGetOne(
      { id: me.id },
      { onboarded: new Date() },
    )
    await tx.transactionCommit()

    return transformUser(updatedUser)
  } catch (e) {
    console.error('setOnboarded', e)
    await tx.transactionRollback()
    throw new Error(t('api/unexpected'))
  }
}
