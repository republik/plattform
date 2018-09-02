const debug = require('debug')('access:lib:constraints:limitSlots')

/**
 * Constraint limits available slots. If all slots are used, contraint will
 * fail.
 *
 * Story: There is only a limited amount of slots that can be shared.
 *
 * @example: {"limitSlots": {"slots": 2}}
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
      AND "accessGrants"."revokedAt" IS NULL
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

const getMeta = async (args, context) => {
  const slots = await getSlots(args, context)

  return {
    visible: true,
    grantable: await isGrantable(args, context),
    payload: {
      slots
    }
  }
}

module.exports = {
  isGrantable,
  getMeta
}
