const debug = require('debug')('access:lib:constraints:limitRevokedSlots')

/**
 * Constraint limits revoked slots. If all slots are used, contraint will fail.
 *
 * Story: There is only a limited amount of slots can be revoked to prevent
 * "infitiy and beyond" usage
 *
 * @example: {"limitRevokedSlots": {"slots": 4}}
 */

const isGrantable = async (args, context) => {
  const { settings, granter, campaign } = args
  const { pgdb } = context

  const revokedSlots = await pgdb.query(`
    SELECT "accessGrants".id

    FROM "accessGrants"

    WHERE
      "accessGrants"."accessCampaignId" = '${campaign.id}'
      AND "accessGrants"."granterUserId" = '${granter.id}'
      AND "accessGrants"."revokedAt" IS NOT NULL
      AND "accessGrants"."invalidatedAt" IS NULL
  `)

  debug(
    'isGrantable',
    {
      granter: granter.id,
      settings,
      campaign,
      revokedSlots: revokedSlots.length
    }
  )

  return settings.slots > revokedSlots.length
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
