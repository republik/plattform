const { Roles } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, context) => {
  const { id, text } = args
  const { user: me, pgdb, loaders, t } = context
  Roles.ensureUserHasRole(me, 'editor')

  const tx = await pgdb.transactionBegin()
  try {
    const memo = await loaders.Memo.byId.load(id)
    
    if (!memo) {
      throw new Error(t('api/publikator/editMemo/error/404'))
    }

    if (memo.userId !== me.id) {
      throw new Error(t('api/publikator/editMemo/error/notYours'))
    }

    const updatedMemo = await tx.publikator.memos.updateAndGetOne(
      { id },
      {
        text,
        published: true,
        ...(memo.text !== text && { updatedAt: new Date() }),
      },
    )

    await tx.transactionCommit()

    return updatedMemo
  } catch (e) {
    await tx.transactionRollback()
    throw e
  }
}
