const debug = require('debug')('access:lib:memberships')

const { Roles } = require('@orbiting/backend-modules-auth')
const { hasUserActiveMembership } = require('@orbiting/backend-modules-utils')

const eventsLib = require('./events')

const addRole = async (grant, user, pgdb, role) => {
  debug(`add ${role} role`, { grant: grant.id, user: user.id })

  if (!Roles.userHasRole(user, role)) {
    await Roles.addUserToRole(user.id, role, pgdb)
    await eventsLib.log(grant, `role.${role}.add`, pgdb)

    debug(`role "${role}" was missing, added`, user.id)

    return true
  } else {
    await eventsLib.log(grant, `role.${role}.present`, pgdb)
  }
  return false
}

const removeRole = async (grant, user, pgdb, role) => {
  debug(`remove ${role} role`, { grant: grant.id, user: user.id })

  if (Roles.userHasRole(user, role)) {
    await Roles.removeUserFromRole(user.id, role, pgdb)
    await eventsLib.log(grant, `role.${role}.remove`, pgdb)

    debug(`role "${role}" was removed`, user.id)

    return true
  } else {
    await eventsLib.log(grant, `role.${role}.notPresent`, pgdb)
  }
  return false
}

const addMemberRole = async (grant, user, pgdb) => {
  const hasMembership = await hasUserActiveMembership(user, pgdb)

  if (!hasMembership) {
    return await addRole(grant, user, pgdb, 'member')
  } else {
    await eventsLib.log(grant, 'recipient.active.membership', pgdb)
  }

  return false
}

const removeMemberRole = async (grant, user, findFn, pgdb) => {
  const hasMembership = await hasUserActiveMembership(user, pgdb)

  const allRecipientGrants = await findFn(user, { pgdb })

  /* Reduced access campaigns are non-trial campaigns and not connected 
  to member role, hence they should be excluded in the list of other 
  grants a user could have */
  const reducedCampaigns = await pgdb.public.accessCampaigns.find({
    type: 'REDUCED',
  })

  const reducedCampaignIds = reducedCampaigns.map((campaign) => {
    return campaign.id
  })

  const allOtherRecipientGrants = allRecipientGrants.filter(
    (otherGrant) =>
      otherGrant.id !== grant.id &&
      !reducedCampaignIds.includes(otherGrant.accessCampaignId),
  )

  if (!hasMembership && allOtherRecipientGrants.length < 1) {
    return await removeRole(grant, user, pgdb, 'member')
  } else {
    await eventsLib.log(grant, 'role.member.keep', pgdb)
  }

  return false
}

const findGiftableMemberships = async (pgdb) =>
  pgdb.query(`
    SELECT
      m.*,
      p."userId" "pledgeUserId",
      p."messageToClaimers" "pledgeMessageToClaimers"

    FROM "memberships" m
    JOIN "pledges" p ON p."userId" = m."userId" AND p.id = m."pledgeId"

    LEFT JOIN "membershipPeriods" mp ON mp."membershipId" = m.id

    WHERE
      m."accessGranted" IS TRUE
      AND mp IS NULL

    GROUP BY m.id, p.id
    ORDER BY m."potPledgeOptionId" DESC, m."createdAt" ASC
  `)

module.exports = {
  addMemberRole,
  removeMemberRole,
  addRole,
  removeRole,
  findGiftableMemberships,
}
