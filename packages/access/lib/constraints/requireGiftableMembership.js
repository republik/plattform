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

const getCounts = async ({ campaign }, { pgdb }) => {
  const giftableMemberships = await memberships.findGiftableMemberships(pgdb)

  const unclaimedAccessGrants = await pgdb.query(`
    SELECT ag.id

    FROM "accessGrants" ag

    WHERE
      ag."accessCampaignId" = '${campaign.id}'
      AND ag."beginAt" IS NULL
      AND ag."revokedAt" IS NULL
      AND ag."invalidatedAt" IS NULL
  `)

  return {
    giftableMemberships: giftableMemberships.length,
    unclaimedAccessGrants: unclaimedAccessGrants.length
  }
}

const isGrantable = async (args, context) => {
  const { settings, granter, campaign } = args

  const { giftableMemberships, unclaimedAccessGrants } = await getCounts(args, context)

  debug(
    'isGrantable',
    {
      granter: granter.id,
      settings,
      campaign,
      giftableMemberships,
      unclaimedAccessGrants,
      isGrantable: giftableMemberships > unclaimedAccessGrants
    }
  )

  // Is grantable if there are more memberships to gift than unclaimed access grants.
  return giftableMemberships > unclaimedAccessGrants
}

const getMeta = async (args, context) => {
  const { giftableMemberships, unclaimedAccessGrants } = await getCounts(args, context)

  return {
    visible: true,
    grantable: await isGrantable(args, context),
    payload: {
      perks: {
        giftableMemberships: giftableMemberships - unclaimedAccessGrants
      }
    }
  }
}

module.exports = {
  isGrantable,
  getMeta
}
