const debug = require('debug')('access:lib:perks:accessWithRole')

const { addRole } = require('../memberships')

const give = async (campaign, grant, recipient, settings, t, pgdb) => {
  if (grant.revokedAt) {
    throw new Error(t('api/access/perk/accessWithRole/grantRevoked/error'))
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
      eventLogExtend: `.${settings.role}`,
    }
  }

  return {}
}

module.exports = { give }
