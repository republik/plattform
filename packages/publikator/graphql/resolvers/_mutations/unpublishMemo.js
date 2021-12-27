const { Roles } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, context) => {
  const { id } = args
  const { user: me, pgdb, loaders, t } = context
  Roles.ensureUserHasRole(me, 'editor')

  const tx = await pgdb.transactionBegin()
  try {
    const memo = await loaders.Memo.byId.load(id)

    if (memo.userId !== me.id) {
      throw new Error(t('api/unpublishMemo/error/notYours')) // @TODO: Add translation
    }

    const updatedMemo = await tx.publikator.memos.updateAndGetOne(
      { id },
      {
        published: false,
        updatedAt: new Date(),
      },
    )

    await tx.transactionCommit()

    return updatedMemo
  } catch (e) {
    await tx.transactionRollback()
    throw e
  }
}
