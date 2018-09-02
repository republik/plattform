const campaignsLib = require('../../lib/campaigns')
const eventsLib = require('../../lib/events')

const { Roles, transformUser } = require('@orbiting/backend-modules-auth')

module.exports = {
  campaign: (grant, args, { pgdb }) => campaignsLib.findByGrant(grant, pgdb),
  grantee: async (grant, args, { user: me, pgdb }) => {
    const grantee =
      await pgdb.public.users.findOne({ id: grant.granteeUserId })

    if (!Roles.userIsMeOrInRoles(grantee, me, ['admin', 'supporter'])) {
      return null
    }

    return transformUser(grantee)
  },
  granteeName: async (grant, args, { user: me, t, pgdb }) => {
    const grantee =
      await pgdb.public.users.findOne({ id: grant.granteeUserId })

    const safeUser = transformUser(grantee)

    return safeUser.name ||
      t('api/access/resolvers/AccessGrant/tallDarkStranger')
  },
  recipient: async (grant, args, { user: me, pgdb }) => {
    if (!grant.recipientUserId) return null

    const recipient =
      await pgdb.public.users.findOne({ id: grant.recipientUserId })

    if (!Roles.userIsMeOrInRoles(recipient, me, ['admin', 'supporter'])) {
      return null
    }

    return transformUser(recipient)
  },
  isValid: (grant) => grant.invalidated !== null,
  events: (grant, args, { pgdb }) => eventsLib.findByGrant(grant, pgdb)
}
