const debug = require('debug')('access:lib:constraints:limitGrants')

/**
 * Constraint limits grants.
 *
 * Story: There is a limited amount of grants a user can share per campaign.
 *
 * @example: {"limitGrants": {"grants": 2}}
 */

const isGrantable = async (args, context) => {
  const { settings, granter, campaign } = args
  const { pgdb } = context

  const grants = await pgdb.query(`
    SELECT "accessGrants".id

    FROM "accessGrants"

    WHERE
      "accessGrants"."accessCampaignId" = '${campaign.id}'
      AND "accessGrants"."granterUserId" = '${granter.id}'
  `)

  const isLimitReached = grants.length >= settings.grants

  debug(
    'isGrantable',
    {
      granter: granter.id,
      settings,
      campaign,
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
