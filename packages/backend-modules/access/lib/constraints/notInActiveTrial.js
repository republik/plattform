const debug = require('debug')('access:lib:constraints:notInActiveTrial')

/**
 * Constraint prohibits starting an access grant when one is already active.
 *
 * Story: If a user already has an active access grant, they cannot start one of the same campaign.
 *
 * @example: {"notInActiveTrial": {}}
 */

const isGrantable = async (args, context) => {
  const { granter, campaign } = args
  const { pgdb } = context

  const now = new Date()

  const activeGrants = await pgdb.public.accessGrants.find({
    accessCampaignId: campaign.id,
    recipientUserId: granter.id,
    invalidatedAt: null,
    revokedAt: null,
    'beginAt<=': now,
    'endAt>=': now,
  })

  const noActiveGrant = !activeGrants || activeGrants.length === 0

  debug('isGrantable', {
    granter: granter.id,
    campaign,
    noActiveGrant,
  })

  return noActiveGrant
}

const getMeta = async (args, context) => ({
  visible: true,
  grantable: await isGrantable(args, context),
  payload: {},
})

module.exports = {
  isGrantable,
  getMeta,
}
