const Roles = require('../../../../lib/Roles')

module.exports = async (_, args, {pgdb, user, req, t}) => {
  Roles.ensureUserHasRole(user, 'member')

  const { id } = args

  const transaction = await pgdb.transactionBegin()
  try {
    // ensure comment exists and belongs to user
    const comment = await transaction.public.comments.findOne({ id })
    if (!comment) {
      throw new Error(t('api/comment/404'))
    }
    if (comment.userId !== user.id) {
      throw new Error(t('api/comment/notYours'))
    }

    await transaction.public.comments.update({
      id: comment.id
    }, {
      published: false
    })

    await transaction.transactionCommit()
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }

  return true
}
