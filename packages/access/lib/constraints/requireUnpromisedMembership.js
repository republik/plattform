const debug = require('debug')('access:lib:constraints:requireUnpromisedMembership')

const memberships = require('../memberships')

/**
 * Checks if there are more (unpromised) memberships than there are unclaimed
 * access grants. An unpromised membership is a membership still to be gifted.
 *
 * Story: User can only get an access grant if a membership is to be gifted.
 *
 * @example: {"requireUnpromisedMembership": {}}
 */

const isGrantable = async (args, context) => {
  const { settings, granter, campaign } = args
  const { pgdb } = context

  const unpromisedMemberships = await memberships.findUnpromisedMemberships(pgdb)

  const unclaimedAccessGrants = await pgdb.query(`
    SELECT ag.id

    FROM "accessGrants" ag

    WHERE
      ag."accessCampaignId" = '${campaign.id}'
      AND ag."beginAt" IS NULL
      AND ag."invalidatedAt" IS NULL
  `)

  const isLimitReached = unpromisedMemberships.length <= unclaimedAccessGrants.length

  debug(
    'isGrantable',
    {
      granter: granter.id,
      settings,
      campaign,
      unpromisedMemberships: unpromisedMemberships.length,
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
