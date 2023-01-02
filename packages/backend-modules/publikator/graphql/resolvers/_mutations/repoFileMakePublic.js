const { Roles } = require('@orbiting/backend-modules-auth')

const { updateAcl } = require('../../../lib/File/utils')

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

    if (file.status === 'Public') {
      throw new Error(t('api/publikator/file/error/publicAlready'))
    }

    if (file.status !== 'Private') {
      throw new Error(t('api/publikator/file/error/notPrivate'))
    }

    const updatedFile = await pgdb.publikator.files.updateAndGetOne(
      { id },
      { status: 'Public', updatedAt: new Date() },
    )

    await updateAcl(updatedFile)

    await tx.transactionCommit()
    return updatedFile
  } catch (e) {
    await tx.transactionRollback()
    throw e
  }
}
