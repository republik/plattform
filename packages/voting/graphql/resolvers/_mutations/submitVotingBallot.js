const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const {
  findById,
  ensureReadyToSubmit
} = require('../../../lib/Voting')

module.exports = async (_, { votingId, optionId }, context) => {
  const { pgdb, user: me, t, req } = context
  ensureSignedIn(req, t)

  const transaction = await pgdb.transactionBegin()
  try {
    const now = new Date()
    const voting = await findById(votingId, transaction)
    await ensureReadyToSubmit(voting, me.id, now, { ...context, pgdb: transaction })

    if (optionId) {
      const votingOption = await transaction.public.votingOptions.findOne({ id: optionId })
      if (!votingOption) {
        throw new Error(t('api/voting/option/404'))
      }
      if (votingOption.votingId !== votingId) {
        throw new Error(t('api/voting/option/votingIdMissmatch'))
      }
    } else if (!voting.allowEmptyBallots) {
      throw new Error(t('api/voting/noEmptyBallots'))
    }

    await transaction.public.ballots.insert({
      votingId: voting.id,
      votingOptionId: optionId,
      userId: me.id,
      createdAt: now,
      updatedAt: now
    })

    await transaction.transactionCommit()

    return voting
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
