const campaignsLib = require('../../lib/campaigns')
const eventsLib = require('../../lib/events')

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
  invalidatedAt: (grant) => grant.invalidatedAt,
  createdAt: (grant) => grant.createdAt,
  updatedAt: (grant) => grant.updatedAt,

  isValid: (grant) => grant.invalidated !== null,

  events: (grant, args, { pgdb }) => eventsLib.findByGrant(grant, pgdb)
}
