const campaignsLib = require('../../lib/campaigns')

module.exports = {
  id: (grant) => grant.id,
  campaign: (grant, args, { pgdb }) => campaignsLib.findByGrant(grant, pgdb),
  grantee: async (grant, args, { user: me, pgdb }) => {
    const user =
      await pgdb.public.users.findOne({ id: grant.granteeUserId })

    return user
  },
  email: (grant) => grant.email,
  recipient: async (grant, args, { user: me, pgdb }) => {
    if (!grant.recipientUserId) return null

    const user =
      await pgdb.public.users.findOne({ id: grant.recipientUserId })

    return user
  },
  beginAt: (grant) => grant.beginAt,
  endAt: (grant) => grant.endAt,
  revokedAt: (grant, args, context) => grant.revokedAt,
  createdAt: (grant) => grant.createdAt,
  updatedAt: (grant) => grant.updatedAt
}
