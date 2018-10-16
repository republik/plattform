const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const {
  findById,
  isEligible,
  userHasSubmitted,
  getCandidacies
} = require('../../../lib/Election')

module.exports = async (_, { electionId, candidacyIds }, { pgdb, user: me, t, req }) => {
  ensureSignedIn(req, t)

  const transaction = await pgdb.transactionBegin()
  try {
    const now = new Date()
    const election = await findById(electionId, pgdb)
    if (!election) {
      throw new Error(t('api/election/404'))
    }
    if (election.beginDate > now) {
      throw new Error(t('api/election/tooEarly'))
    }
    if (election.endDate < now) {
      throw new Error(t('api/election/tooLate'))
    }

    if (!(await isEligible(me.id, election, transaction))) {
      throw new Error(t('api/election/notEligible'))
    }

    if (await userHasSubmitted(election.id, me.id, transaction)) {
      throw new Error(t('api/election/alreadySubmitted'))
    }

    // check legitimacy of candidacyIds
    if (candidacyIds.length > 0) {
      const candidacies = await getCandidacies(election, transaction)
      for (let candidacyId of candidacyIds) {
        if (!candidacies.find(c => c.id === candidacyId)) {
          throw new Error(t('api/election/candidacy/404'))
        }
      }
    }

    let paddedCandidacyIds = candidacyIds
    if (candidacyIds.length < election.numSeats) {
      if (!election.allowEmptyBallots) {
        throw new Error(t('api/election/noEmptyBallots'))
      }
      paddedCandidacyIds = Array.from(
        { length: election.numSeats },
        (v, i) => candidacyIds[i] || null
      )
    }

    await Promise.all(
      paddedCandidacyIds.map(candidacyId =>
        transaction.public.electionBallots.insert({
          electionId: election.id,
          candidacyId,
          userId: me.id,
          createdAt: now,
          updatedAt: now
        })
      )
    )

    await transaction.transactionCommit()

    return election
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
