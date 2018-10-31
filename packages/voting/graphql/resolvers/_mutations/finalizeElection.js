const { Roles } = require('@orbiting/backend-modules-auth')
const {
  findBySlug,
  finalize
} = require('../../../lib/Election')

module.exports = async (_, args, { pgdb, user: me, t }) => {
  Roles.ensureUserHasRole(me, 'admin')
  const { slug, dry } = args

  const transaction = await pgdb.transactionBegin()
  try {
    const now = new Date()
    const election = await findBySlug(slug, transaction)
    if (!election) {
      throw new Error(t(`api/election/404`))
    }
    if (election.result) {
      throw new Error(t(`api/election/result/alreadyFinalized`))
    }
    if (!dry && election.endDate > now) {
      throw new Error(t(`api/election/result/tooEarly`))
    }

    const result = await finalize(election, args, transaction, t)

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
