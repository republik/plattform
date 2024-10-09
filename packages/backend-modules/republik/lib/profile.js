const hasUserActiveMembership = require('@orbiting/backend-modules-utils/hasUserActiveMembership')
const {
  hasUserCandidacies,
  hasUserCandidaciesInCandidacyPhase,
  hasUserCandidaciesInElectionPhase,
} = require('@orbiting/backend-modules-voting/lib/Candidacy')

exports.isEligible = async (user, pgdb) => {
  return await hasUserActiveMembership(user, pgdb)
}

/**
 * Check if profile (actually user) has submitted a candidacy.
 */
exports.isInCandidacy = hasUserCandidacies
exports.isInCandidacyInCandidacyPhase = hasUserCandidaciesInCandidacyPhase
exports.isInCandidacyInElectionPhase = hasUserCandidaciesInElectionPhase
