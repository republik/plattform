module.exports = async ({ user, hasJustPaid, pgdb, ...rest }) => {
  const pledges = await pgdb.public.pledges.find({
    userId: user.id,
    status: 'SUCCESSFUL'
  })

  const hasPledge = !!pledges && pledges.length > 0

  const hasJustPaidFirstPledge = !!hasJustPaid && hasPledge && pledges.length === 1

  const hasMembership = await pgdb.public.memberships.findFirst({
    userId: user.id,
    active: true
  })

  const membershipTypeBenefactor = await pgdb.public.membershipTypes.findOne({
    name: 'BENEFACTOR_ABO'
  })

  const isBenefactor = membershipTypeBenefactor ? await pgdb.public.memberships.findFirst({
    userId: user.id,
    membershipTypeId: membershipTypeBenefactor.id
  }) : false

  return {
    ...rest,
    pgdb,
    hasJustPaid,
    hasJustPaidFirstPledge,
    hasMembership,
    isBenefactor,
    hasPledge
  }
}
