const debug = require('debug')('access:lib:constraints:limitRevokedSlots')

/**
 * Constraint limits revoked slots. If all slots are used, contraint will fail.
 *
 * Story: There is only a limited amount of slots can be revoked to prevent
 * "infitiy and beyond" usage
 *
 * @example: {"limitRevokedSlots": {"slots": 4}}
 */

const getSlots = async (
  { settings, grantee, campaign },
  { pgdb }
) => {
  const slots = settings.slots

  const usedSlots = await pgdb.query(`
    SELECT "accessGrants".id

    FROM "accessGrants"

    WHERE
      "accessGrants"."accessCampaignId" = '${campaign.id}'
      AND "accessGrants"."granteeUserId" = '${grantee.id}'
      AND "accessGrants"."endAt" >= NOW()
      AND "accessGrants"."revokedAt" IS NOT NULL
      AND "accessGrants"."invalidatedAt" IS NULL
  `)

  return {
    total: slots,
    used: usedSlots.length,
    free: slots - usedSlots.length
  }
}

const isGrantable = async (args, context) => {
  const { settings, grantee, campaign } = args

  const slots = await getSlots(args, context)

  debug(
    'isGrantable',
    {
      grantee: grantee.id,
      settings,
      campaign,
      slots
    }
  )

  return slots.free > 0
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
