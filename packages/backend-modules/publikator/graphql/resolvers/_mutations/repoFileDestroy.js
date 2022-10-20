const { Roles } = require('@orbiting/backend-modules-auth')

const { destroy } = require('../../../lib/File/utils')

module.exports = async (_, args, context) => {
  const { id } = args
  const { user: me, loaders, pgdb, t } = context
  Roles.ensureUserHasRole(me, 'editor')

  const tx = await pgdb.transactionBegin()

  try {
    const file = await loaders.File.byId.load(id)
    if (!file) {
      throw new Error(t('api/publikator/file/404'))
    }

    if (file.status !== 'Failure') {
      throw new Error(t('api/publikator/file/error/notFailure'))
    }

    const updatedFile = await pgdb.publikator.files.updateAndGetOne(
      { id },
      { status: 'Destroyed', destroyedAt: new Date() },
    )

    await destroy(updatedFile)

    await tx.transactionCommit()
    return updatedFile
  } catch (e) {
    await tx.transactionRollback()
    throw e
  }
}
