const {
  hasUserCandidacies,
  hasUserCandidaciesInCandidacyPhase,
  hasUserCandidaciesInElectionPhase
} = require('@orbiting/backend-modules-voting/lib/Candidacy')

exports.isEligible = async (userId, pgdb) => {
  const hasPledges = !!(await pgdb.public.pledges.findFirst({
    userId
  }))
  const hasMembership = !!(await pgdb.public.memberships.findFirst({
    userId,
    active: true
  }))
  return hasPledges || hasMembership
}

/**
 * Check if profile (actually user) has submitted a candidacy.
 */
exports.isInCandidacy = hasUserCandidacies
exports.isInCandidacyInCandidacyPhase = hasUserCandidaciesInCandidacyPhase
exports.isInCandidacyInElectionPhase = hasUserCandidaciesInElectionPhase
