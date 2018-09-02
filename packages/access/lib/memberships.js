const debug = require('debug')('access:lib:memberships')

const { Roles } = require('@orbiting/backend-modules-auth')

const eventsLib = require('./events')

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

const addMemberRole = async (grant, user, pgdb) => {
  debug('addMemberRole')

  const hasMembership = await hasUserActiveMembership(user, pgdb)

  if (
    !hasMembership &&
    !Roles.userHasRole(user, 'member')
  ) {
    await Roles.addUserToRole(user.id, 'member', pgdb)
    await eventsLib.log(grant, 'role.add', pgdb)

    debug('role "member" was missing, added', user.id)

    return true
  } else {
    await eventsLib.log(grant, 'role.present', pgdb)
  }

  return false
}

const removeMemberRole = async (grant, user, findFn, pgdb) => {
  debug('removeMemberRole')

  const hasMembership = await hasUserActiveMembership(user, pgdb)

  const allRecipientGrants = await findFn(user, pgdb)
  const allOtherRecipientGrants =
    allRecipientGrants.filter(otherGrant => otherGrant.id !== grant.id)

  if (
    !hasMembership &&
    allOtherRecipientGrants.length < 1 &&
    Roles.userHasRole(user, 'member')
  ) {
    await Roles.removeUserFromRole(user.id, 'member', pgdb)
    await eventsLib.log(grant, 'role.remove', pgdb)

    debug('role "member" unwarranted, removing', user.id)

    return true
  } else {
    await eventsLib.log(grant, 'role.keep', pgdb)
  }

  return false
}

module.exports = {
  hasUserActiveMembership,
  addMemberRole,
  removeMemberRole
}
