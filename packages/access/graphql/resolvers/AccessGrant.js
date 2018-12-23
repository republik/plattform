const campaignsLib = require('../../lib/campaigns')
const eventsLib = require('../../lib/events')

const { Roles, transformUser } = require('@orbiting/backend-modules-auth')

const PRIVILEDGED_ROLES = ['admin', 'supporter']

module.exports = {
  campaign: (grant, args, { pgdb }) => campaignsLib.findByGrant(grant, pgdb),
  granter: async (grant, args, { user: me, pgdb }) => {
    const granter =
      await pgdb.public.users.findOne({ id: grant.granterUserId })

    if (!Roles.userIsMeOrInRoles(granter, me, ['admin', 'supporter'])) {
      return null
    }

    return transformUser(granter)
  },
  granterName: async (grant, args, { user: me, t, pgdb }) => {
    const granter =
      await pgdb.public.users.findOne({ id: grant.granterUserId })

    const safeUser = transformUser(granter)

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
  status: (grant, args, { user: me, t }) => {
    if (!Roles.userIsInRoles(me, PRIVILEDGED_ROLES)) {
      return null
    }

    if (grant.invalidatedAt) {
      return t('api/access/resolvers/AccessGrant/status/invalidated')
    }

    if (grant.revokedAt) {
      return t('api/access/resolvers/AccessGrant/status/revoked')
    }

    if (!grant.recipientUserId) {
      return t('api/access/resolvers/AccessGrant/status/unclaimed')
    }

    return t('api/access/resolvers/AccessGrant/status/valid')
  },
  events: (grant, args, { user: me, pgdb }) => {
    if (!Roles.userIsInRoles(me, PRIVILEDGED_ROLES)) {
      return null
    }

    return eventsLib.findByGrant(grant, pgdb)
  }
}
