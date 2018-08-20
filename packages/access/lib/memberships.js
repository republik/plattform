const debug = require('debug')('access:lib:memberships')

const addMemberRole = (user, pgdb) => {
  debug('addMemberRole')
}

const removeMemberRole = (user, pgdb) => {
  debug('removeMemberRole')
}

const hasUserActiveMembership = async (user, pgdb) => {
  const memberships = await pgdb.query(`
    SELECT memberships.id, packages.name
    FROM memberships

    INNER JOIN "membershipPeriods"
      ON memberships.id = "membershipPeriods"."membershipId"

    INNER JOIN pledges
      ON memberships."pledgeId" = pledges.id

    INNER JOIN packages
      ON pledges."packageId" = packages.id

    WHERE
      memberships."userId" = '${user.id}'
      AND "beginDate" <= NOW()
      AND "endDate" > NOW()
  `)

  debug('hasUserActiveMembership', user.id, memberships)

  return memberships.length > 0
}

module.exports = {
  addMemberRole,
  removeMemberRole,
  hasUserActiveMembership
}
