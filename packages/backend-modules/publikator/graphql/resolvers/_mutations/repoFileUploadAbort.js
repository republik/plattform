const { Roles } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, context) => {
  const { id, error } = args
  const { user: me, loaders, pgdb, t } = context
  Roles.ensureUserHasRole(me, 'editor')

  const tx = await pgdb.transactionBegin()

  try {
    const file = await loaders.File.byId.load(id)
    if (!file) {
      throw new Error(t('api/publikator/file/404'))
    }

    if (file.status !== 'Pending') {
      throw new Error(t('api/publikator/file/error/notPending'))
    }

    if (file.userId !== me.id) {
      throw new Error(t('api/publikator/file/error/notYours'))
    }

    const updatedFile = await pgdb.publikator.files.updateAndGetOne(
      { id },
      { status: 'Failure', error, failedAt: new Date() },
    )

    await tx.transactionCommit()
    return updatedFile
  } catch (e) {
    await tx.transactionRollback()
    throw e
  }
}
