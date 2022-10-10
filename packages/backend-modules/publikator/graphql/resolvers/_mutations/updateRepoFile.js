const { Roles } = require('@orbiting/backend-modules-auth')

const { updateAcl } = require('../../../lib/File/utils')

module.exports = async (_, args, context) => {
  const { id, public: _public } = args
  const { user: me, loaders, pgdb, t } = context
  Roles.ensureUserHasRole(me, 'editor')

  const tx = await pgdb.transactionBegin()

  try {
    const file = await loaders.File.byId.load(id)
    if (!file) {
      throw new Error(t('api/publikator/file/404'))
    }

    if (!['PUBLIC', 'PRIVATE'].includes(file.status)) {
      throw new Error(t('api/publikator/file/updateError'))
    }

    if (file.status === 'PUBLIC' && !_public) {
      throw new Error(t('api/publikator/file/changePublicError'))
    }

    const updatedFile = await pgdb.publikator.files.updateAndGetOne(
      { id },
      { status: _public ? 'PUBLIC' : 'PRIVATE', updatedAt: new Date() },
    )

    await updateAcl(updatedFile)

    await tx.transactionCommit()
    return file
  } catch (e) {
    await tx.transactionRollback()
    throw e
  }
}
