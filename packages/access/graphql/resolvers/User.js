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

    debug('accessGrants', { user: user.id, grants: grants.length })

    return grants
  },
  accessCampaigns: async (user, args, { user: me, pgdb }) => {
    if (!Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter'])) {
      return null
    }

    const campaigns = await campaignsLib.findForGrantee(user, pgdb)

    debug('accessCampaigns', { user: user.id, campaigns: campaigns.length })

    return campaigns.map(campaign => ({ ...campaign, _user: user }))
  }
}
