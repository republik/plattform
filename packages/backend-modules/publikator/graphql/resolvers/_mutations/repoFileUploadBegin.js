const { Roles } = require('@orbiting/backend-modules-auth')

const { getSafeFileName } = require('../../../lib/File/utils')

module.exports = async (_, args, context) => {
  const { repoId, name } = args
  const { user: me, loaders, pgdb, t } = context
  Roles.ensureUserHasRole(me, 'editor')

  const tx = await pgdb.transactionBegin()

  try {
    const repo = await loaders.Repo.byId.load(repoId)
    if (!repo) {
      throw new Error(t('api/publikator/repo/404'))
    }

    const safeFileName = getSafeFileName(name)

    const file = await pgdb.publikator.files.insertAndGet({
      repoId: repo.id,
      name: safeFileName,
      status: 'Pending',
      userId: me.id,
      author: {
        name: me.name,
        email: me.email,
      },
    })

    await tx.transactionCommit()
    return file
  } catch (e) {
    await tx.transactionRollback()
    throw e
  }
}
