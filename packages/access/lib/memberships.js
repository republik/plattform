const debug = require('debug')('access:lib:memberships')

const { Roles } = require('@orbiting/backend-modules-auth')
const { hasUserActiveMembership } = require('@orbiting/backend-modules-utils')

const eventsLib = require('./events')

const addMemberRole = async (grant, user, pgdb) => {
  debug('addMemberRole', { grant: grant.id, user: user.id })

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
  debug('removeMemberRole', { grant: grant.id, user: user.id })

  const hasMembership = await hasUserActiveMembership(user, pgdb)

  const allRecipientGrants = await findFn(user, { pgdb })
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
  addMemberRole,
  removeMemberRole
}
