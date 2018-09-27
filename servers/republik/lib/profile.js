const { findByUser } =
  require('@orbiting/backend-modules-election/lib/candidacies')

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
exports.isInCandidacy = async (user, pgdb) => {
  return !!findByUser(user, pgdb)
}
