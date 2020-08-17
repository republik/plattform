const {
  hasUserCandidacies,
  hasUserCandidaciesInCandidacyPhase,
  hasUserCandidaciesInElectionPhase
} = require('@orbiting/backend-modules-voting/lib/Candidacy')
const { cards: cardsLib } = require('@orbiting/backend-modules-cards')

exports.isEligible = async (userId, pgdb) => {
  return !!(await pgdb.public.memberships.findFirst({
    userId,
    active: true
  }))
}

/**
 * Check if profile (actually user) has submitted a candidacy.
 */
exports.isInCandidacy = hasUserCandidacies
exports.isInCandidacyInCandidacyPhase = hasUserCandidaciesInCandidacyPhase
exports.isInCandidacyInElectionPhase = hasUserCandidaciesInElectionPhase

/**
 * Check if user has cards
 */
exports.hasCards = cardsLib.hasCards
