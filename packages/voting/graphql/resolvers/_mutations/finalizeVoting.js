const { Roles } = require('@orbiting/backend-modules-auth')
const {
  findBySlug,
  finalize
} = require('../../../lib/Voting')

module.exports = async (_, args, { pgdb, user: me, t }) => {
  Roles.ensureUserHasRole(me, 'admin')
  const { slug, dry } = args

  const transaction = await pgdb.transactionBegin()
  try {
    const now = new Date()
    const voting = await findBySlug(slug, transaction)
    if (!voting) {
      throw new Error(t(`api/voting/404`))
    }
    if (voting.result) {
      throw new Error(t(`api/voting/result/alreadyFinalized`))
    }
    if (!dry && voting.endDate > now) {
      throw new Error(t(`api/voting/result/tooEarly`))
    }

    const result = await finalize(voting, args, transaction, t)

    if (dry) {
      await transaction.transactionRollback()
    } else {
      await transaction.transactionCommit()
    }

    return result
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
