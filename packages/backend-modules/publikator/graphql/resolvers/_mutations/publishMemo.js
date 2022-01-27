const { Roles } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, context) => {
  const { id, repoId, parentId, text } = args
  const { user: me, pgdb, loaders } = context
  Roles.ensureUserHasRole(me, 'editor')

  const tx = await pgdb.transactionBegin()
  try {
    const parentMemo = parentId && await loaders.Memo.byId.load(parentId)

    const memo = await tx.publikator.memos.insertAndGet({
      ...(id && { id }),
      repoId,
      parentIds: [...(parentMemo?.parentIds || []), parentMemo?.id].filter(Boolean),
      text,
      userId: me.id,
      author: {
        name: me.name,
        email: me.email,
      }
    })

    await tx.transactionCommit()

    return memo
  } catch (e) {
    await tx.transactionRollback()
    throw e
  }
}
