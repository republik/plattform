const moment = require('moment')
const { ascending } = require('d3-array')

module.exports = async (memberships, pgdb, dryRun) => {
  const membershipTypeIndex = (
    await pgdb.public.membershipTypes.findAll()
  ).reduce(
    (index, type) => {
      index[type.id] = type
      return index
    },
    {}
  )
  const packagesIndex = (
    await pgdb.public.packages.findAll()
  ).reduce(
    (index, p) => {
      index[p.id] = p
      return index
    },
    {}
  )

  const yearlyMemberships = memberships.filter(m => membershipTypeIndex[m.membershipTypeId].name !== 'MONTHLY_ABO')
  if (!yearlyMemberships.length) {
    return
  }

  const membershipPeriods = await pgdb.public.membershipPeriods.find({
    membershipId: memberships.map(m => m.id)
  })
  const unusedMemberships = yearlyMemberships.filter(m => !membershipPeriods.find(p => p.membershipId === m.id))
  if (!unusedMemberships.length) {
    return
  }

  const pledges = await pgdb.public.pledges.find({
    id: memberships.map(m => m.pledgeId)
  })

  const inactiveMemberships = unusedMemberships.filter(m => {
    const pledge = pledges.find(p => p.id === m.pledgeId)
    return packagesIndex[pledge.packageId].name !== 'ABO_GIVE' || !m.voucherCode
  })
  if (!inactiveMemberships.length) {
    return
  }

  inactiveMemberships.sort((a, b) => ascending(a.sequenceNumber, b.sequenceNumber))

  const electedMembership = (
    inactiveMemberships.find(m => m.voucherCode === null) ||
    inactiveMemberships.find(m => m.reducedPrice) ||
    inactiveMemberships.find(m => membershipTypeIndex[m.membershipTypeId].name === 'BENEFACTOR_ABO') ||
    inactiveMemberships[0]
  )

  if (dryRun) {
    return electedMembership
  }

  const beginDate = new Date() // now
  const endDate = moment(beginDate).add(1, 'year')
  await pgdb.public.memberships.update({
    id: electedMembership.id
  }, {
    active: true,
    renew: true,
    voucherCode: null,
    voucherable: false
  })

  await pgdb.public.membershipPeriods.insert({
    membershipId: electedMembership.id,
    beginDate,
    endDate
  })

  return electedMembership
}
