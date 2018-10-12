const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const { findById, isEligible } = require('../../../lib/Voting')

module.exports = async (_, { votingId, optionId }, { pgdb, user: me, t, req }) => {
  ensureSignedIn(req, t)

  const transaction = await pgdb.transactionBegin()
  try {
    const now = new Date()
    const voting = await findById(votingId, pgdb)
    if (!voting) {
      throw new Error(t('api/voting/404'))
    }
    if (voting.beginDate > now) {
      throw new Error(t('api/voting/tooEarly'))
    }
    if (voting.endDate < now) {
      throw new Error(t('api/voting/tooLate'))
    }

    if (!(await isEligible(me.id, voting, transaction))) {
      throw new Error(t('api/voting/membershipRequired'))
    }

    // ensure user has not voted yet
    if (await transaction.public.ballots.findFirst({
      userId: me.id,
      votingId: voting.id
    })) {
      throw new Error(t('api/voting/alreadyVoted'))
    }

    if (optionId) {
      const votingOption = await transaction.public.votingOptions.findOne({ id: optionId })
      if (!votingOption) {
        throw new Error(t('api/voting/option/404'))
      }
    } else if (!voting.allowEmptyBallots) {
      throw new Error(t('api/voting/noEmptyBallots'))
    }

    await transaction.public.ballots.insert({
      votingId: voting.id,
      votingOptionId: optionId,
      userId: me.id
    })

    await transaction.transactionCommit()

    return voting
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
