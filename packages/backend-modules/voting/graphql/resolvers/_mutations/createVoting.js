const { Roles } = require('@orbiting/backend-modules-auth')
const {
  slugExists,
  create,
  findByGroupSlug,
  haveSameRestrictions,
} = require('../../../lib/Voting')

module.exports = async (_, { votingInput }, context) => {
  const { pgdb, user: me, t } = context
  Roles.ensureUserIsInRoles(me, ['admin', 'supporter', 'editor'])

  const { slug, groupSlug } = votingInput

  const transaction = await pgdb.transactionBegin()
  try {
    if (await slugExists(slug, transaction)) {
      throw new Error(t('api/voting/exists'))
    }

    const newVoting = await create(
      {
        ...votingInput,
      },
      transaction,
    )

    if (groupSlug) {
      const groupedVotings = await findByGroupSlug(groupSlug, pgdb)
      const conflictingRestrictions = groupedVotings.filter(
        (v) => !haveSameRestrictions(newVoting, v),
      )
      if (conflictingRestrictions.length) {
        throw new Error(t('api/voting/group/restrictionsMissmatch'))
      }
    }

    await transaction.transactionCommit()

    return newVoting
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
