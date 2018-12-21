const debug = require('debug')('access:resolvers:User')

const { Roles } = require('@orbiting/backend-modules-auth')

const grantsLib = require('../../lib/grants')
const campaignsLib = require('../../lib/campaigns')

const PRIVILEDGED_ROLES = ['admin', 'supporter']

module.exports = {
  accessGrants: async (user, { withPast }, { user: me, pgdb }) => {
    if (!Roles.userIsMeOrInRoles(user, me, PRIVILEDGED_ROLES)) {
      return null
    }

    if (!Roles.userIsInRoles(me, PRIVILEDGED_ROLES)) {
      withPast = false
    }

    const grants = await grantsLib.findByRecipient(
      user,
      { withPast, pgdb }
    )

    debug('accessGrants', { user: user.id, grants: grants.length })

    return grants
  },
  accessCampaigns: async (user, { withPast }, { user: me, pgdb }) => {
    if (!Roles.userIsMeOrInRoles(user, me, PRIVILEDGED_ROLES)) {
      return null
    }

    if (!Roles.userIsInRoles(me, PRIVILEDGED_ROLES)) {
      withPast = false
    }

    const campaigns = await campaignsLib.findForGranter(
      user,
      { withPast, pgdb }
    )

    debug('accessCampaigns', { user: user.id, campaigns: campaigns.length })

    return campaigns.map(campaign => ({ ...campaign, _user: user }))
  }
}
