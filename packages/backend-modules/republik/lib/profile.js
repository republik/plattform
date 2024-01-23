const {
  hasUserCandidacies,
  hasUserCandidaciesInCandidacyPhase,
  hasUserCandidaciesInElectionPhase,
} = require('@orbiting/backend-modules-voting/lib/Candidacy')

exports.isEligible = async (userId, pgdb) => {
  return !!(await pgdb.public.memberships.findFirst({
    userId,
    active: true,
  }))
}

/**
 * Check if profile (actually user) has submitted a candidacy.
 */
exports.isInCandidacy = hasUserCandidacies
exports.isInCandidacyInCandidacyPhase = hasUserCandidaciesInCandidacyPhase
exports.isInCandidacyInElectionPhase = hasUserCandidaciesInElectionPhase
