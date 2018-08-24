const debug = require('debug')('access:resolvers:User')

const { Roles } = require('@orbiting/backend-modules-auth')

const grantsLib = require('../../lib/grants')
const campaignsLib = require('../../lib/campaigns')

module.exports = {
  accessGrants: async (user, args, { user: me, pgdb }) => {
    if (!Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter'])) {
      return null
    }

    const grants = await grantsLib.findByRecipient(user, pgdb)

    const userIds = grants.map(grant => grant.granteeUserId)
      .concat(grants.map(grant => grant.recipientUserId))

    const users =
      grants.length > 0
        ? await pgdb.public.users.find({ id: userIds })
        : []

    debug('accessGrants', { user: user.id, grants: grants.length, userIds })

    return grants.map(grant => ({...grant, users}))
  },

  accessCampaigns: async (user, args, { user: me, pgdb }) => {
    if (!Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter'])) {
      return null
    }

    const campaigns = await campaignsLib.findForGrantee(user, pgdb)

    debug('accessCampaigns', { user: user.id, campaigns: campaigns.length })

    return campaigns.map(campaign => {
      return {...campaign, user}
    })
  }
}
