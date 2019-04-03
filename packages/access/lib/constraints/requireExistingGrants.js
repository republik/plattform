const debug = require('debug')('access:lib:constraints:requireExistingGrants')

/**
 * Contraint checks if a granter has grants in campaign. If false, constraint
 * will hinder display of campaign.
 *
 * Story: User should only see campaign if grants are in campaign. Grants may
 * be pre-generated e.g. a series of voucher codes which may be printed on
 * business cards.
 *
 * @example: {"requireExistingGrants": {}}
 */

const getMeta = async (args, context) => {
  const { granter, campaign } = args
  const { pgdb } = context

  const hasGrants = await pgdb.query(`
    SELECT "accessGrants".id

    FROM "accessGrants"

    WHERE
      "accessGrants"."accessCampaignId" = '${campaign.id}'
      AND "accessGrants"."granterUserId" = '${granter.id}'
      AND "accessGrants"."revokedAt" IS NULL
      AND "accessGrants"."invalidatedAt" IS NULL
  `)

  const meta = {
    visible: hasGrants.length > 0,
    grantable: null,
    payload: {}
  }

  debug(
    'getMeta',
    {
      granter: granter.id,
      campaign,
      meta
    }
  )

  return meta
}

module.exports = {
  isGrantable: () => true,
  getMeta
}
