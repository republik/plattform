const debug = require('debug')('access:lib:perks:accessWithRole')

const { hasUserActiveMembership } = require('@orbiting/backend-modules-utils')
const { addRole } = require('../memberships')

const give = async (campaign, grant, recipient, settings, t, pgdb) => {
  if (grant.revokedAt) {
    throw new Error(t('api/access/perk/giftMembership/grantRevoked/error'))
  }

  if (grant.granter.id === recipient.id) {
    throw new Error(t('api/access/perk/giftMembership/selfClaim/error'))
  }

  const hasActiveMembership = await hasUserActiveMembership(recipient, pgdb)

  if (hasActiveMembership) {
    throw new Error(
      t('api/access/perk/giftMembership/hasActiveMembership/error'),
    )
  }
  const isRoleAdded = await addRole(grant, recipient, pgdb, settings.role)

  if (isRoleAdded) {
    debug('give', {
      recipient: recipient.id,
      addedRole: settings.role,
    })
    return {
      recipient: recipient.id,
      addedRole: settings.role,
    }
  }

  return {}
}

module.exports = { give }
