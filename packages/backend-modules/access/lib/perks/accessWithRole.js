const debug = require('debug')('access:lib:perks:accessWithRole')

const { addRole, removeRole, removeMemberRole } = require('../memberships')
const MEMBER_ROLE = 'member'

const give = async (campaign, grant, recipient, settings, t, pgdb) => {
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

const revoke = async (grant, recipient, settings, pgdb, findByRecipient) => {
  const isRoleRevoked =
    settings.role === MEMBER_ROLE
      ? await removeMemberRole(grant, recipient, findByRecipient, pgdb)
      : await removeRole(grant, recipient, pgdb, settings.role)
  if (isRoleRevoked) {
    debug('revoke', {
      recipient: recipient.id,
      revokedRole: settings.role,
    })
    return {
      recipient: recipient.id,
      revokedRole: settings.role,
      eventLogExtend: `.${settings.role}`,
    }
  }

  return {}
}

module.exports = { give, revoke }
