const debug = require('debug')('access:lib:constraints:limitClaims')

/**
 * Constraint limits claims.
 *
 * Story: There is a limited amount of times a user can claim an access grant. Works for campaigns where the recipient is the granter (like Probelesen or trial).
 * Throws an error only if the claims are in the past.
 *
 * @example: {"limitClaims": {"allowedClaims": 1}}
 */

const isGrantable = async (args, context) => {
  const { settings, granter, campaign } = args
  const { pgdb } = context

  const pastClaims = await pgdb.query(
    `
    SELECT "accessGrants".id
    FROM "accessGrants"
    WHERE
      "accessGrants"."accessCampaignId" = :campaignId
      AND "accessGrants"."recipientUserId" = :granterId
      AND ("accessGrants"."revokedAt" IS NOT NULL
        OR "accessGrants"."invalidatedAt" IS NOT NULL
        OR "accessGrants"."endAt" < now())
  `,
    { campaignId: campaign.id, granterId: granter.id },
  )

  const isLimitReached = pastClaims.length >= settings.allowedClaims

  debug('isGrantable', {
    granter: granter.id,
    settings,
    campaign,
    isLimitReached,
  })

  return !isLimitReached
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
