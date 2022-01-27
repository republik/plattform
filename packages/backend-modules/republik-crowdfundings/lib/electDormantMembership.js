const { ascending } = require('d3-array')
const debug = require('debug')('crowdfundings:lib:electDormantMembership')

const {
  resolveMemberships,
  findDormantMemberships,
} = require('./CustomPackages')

module.exports = async ({ id: userId }, pgdb) => {
  const userMemberships = await resolveMemberships({
    memberships: await pgdb.public.memberships.find({
      userId,
    }),
    pgdb,
  })

  debug('user memberships: %d (User: %s)', userMemberships.length, userId)

  const dormantMemberships = findDormantMemberships({
    memberships: userMemberships,
    user: { id: userId },
  })

  // End here if there is no dormant membership to be found
  if (!dormantMemberships.length) {
    debug('no dormant memberships found')
    return
  }

  debug('dormant memberships: %d (user: %s)', dormantMemberships.length, userId)

  // Elect a dormant membership to activate. Rule is to elect dormant
  // membership with lowest sequenceNumber.
  // Sorts sequenceNumber ascending, uses first row. Will overwrite, if a
  // membershipType BENEFACTOR_ABO comes by.
  const electedDormantMembership = dormantMemberships
    .sort((a, b) => ascending(a.sequenceNumber, b.sequenceNumber))
    .reduce(
      (acc, curr) =>
        (!acc && curr) ||
        (acc.membershipType.name !== 'BENEFACTOR_ABO' &&
          curr.membershipType.name === 'BENEFACTOR_ABO' &&
          curr) ||
        acc,
    )

  debug(
    'elected membership: %s %s (user: %s)',
    electedDormantMembership.id,
    electedDormantMembership.membershipType.name,
    userId,
  )

  return electedDormantMembership
}
