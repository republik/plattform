exports.isEligible = async (userId, pgdb) => {
  const hasPledges = !!(await pgdb.public.pledges.findFirst({
    userId
  }))
  const hasMembership = !!(await pgdb.public.memberships.findFirst({userId}))
  return hasPledges || hasMembership
}
