const debug = require('debug')('access:lib:constraints:recipientInNoSlot')

/**
 * Contraint checks if recipient's email address is in a slot already. If so,
 * contraint will fail.
 *
 * Story: An access grant recipient's email address should be unique per
 * campaign.
 *
 * @example: {"recipientNotInSlot": {}}
 */

const isGrantable = async (args, context) => {
  const { email, granter, campaign } = args
  const { pgdb } = context

  const usedSlots = await pgdb.query(`
    SELECT "accessGrants".id

    FROM "accessGrants"

    WHERE
      "accessGrants"."accessCampaignId" = '${campaign.id}'
      AND "accessGrants"."granterUserId" = '${granter.id}'
      AND "accessGrants"."email" = '${email}'
      AND "accessGrants"."revokedAt" IS NULL
      AND "accessGrants"."invalidatedAt" IS NULL
  `)

  debug({
    granter: granter.id,
    email,
    usedSlots
  })

  return usedSlots.length === 0
}

const getMeta = () => ({
  visible: true,
  grantable: null, // unkown if it is grantable
  payload: {}
})

module.exports = {
  isGrantable,
  getMeta
}
