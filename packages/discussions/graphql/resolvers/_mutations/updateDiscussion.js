const { Roles } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, { pgdb, user, t }) => {
  Roles.ensureUserIsInRoles(user, ['editor', 'admin'])

  const {
    id,
    closed
  } = args

  const transaction = await pgdb.transactionBegin()
  try {
    const discussion = await transaction.public.discussions.findOne({
      id
    })
    if (!discussion) {
      throw new Error(t('api/discussion/404'))
    }

    let updatedDiscussion
    if (closed !== undefined) {
      updatedDiscussion = await pgdb.public.discussions.updateAndGetOne(
        { id },
        { closed }
      )
    }

    await transaction.transactionCommit()

    return updatedDiscussion || discussion
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
