const debug = require('debug')('access:lib:constraints:requireGiftableMembership')

const memberships = require('../memberships')

/**
 * Checks if there are more giftable memberships than there are unclaimed
 * access grants.
 *
 * Story: User can only get an access grant if a membership is to be gifted.
 *
 * @example: {"requireGiftableMembership": {}}
 */

const isGrantable = async (args, context) => {
  const { settings, granter, campaign } = args
  const { pgdb } = context

  const giftableMemberships = await memberships.findGiftableMemberships(pgdb)

  const unclaimedAccessGrants = await pgdb.query(`
    SELECT ag.id

    FROM "accessGrants" ag

    WHERE
      ag."accessCampaignId" = '${campaign.id}'
      AND ag."beginAt" IS NULL
      AND ag."invalidatedAt" IS NULL
  `)

  const isLimitReached = giftableMemberships.length <= unclaimedAccessGrants.length

  debug(
    'isGrantable',
    {
      granter: granter.id,
      settings,
      campaign,
      giftableMemberships: giftableMemberships.length,
      unclaimedAccessGrants: unclaimedAccessGrants.length,
      isLimitReached
    }
  )

  return !isLimitReached
}

const getMeta = async (args, context) => ({
  visible: true,
  grantable: await isGrantable(args, context),
  payload: {}
})

module.exports = {
  isGrantable,
  getMeta
}
