const debug = require('debug')('access:lib:constraints:granteeBlacklist')

/**
 * Constraint checks if grantee's user ID is in constraint's settings.userIds[].
 * If found, contraint fails. Contraint will hinder display of campaign.
 *
 * Story: A blacklisted grantee can't grant access.
 *
 * @example: {"granteeBlacklist": {"userIds": ["id1", "id2",... "idn"]}}
 */

const isGrantable = async (args, context) => {
  const { grantee, settings } = args

  const valid = !settings.userIds.includes(grantee.id)

  debug(
    'isGrantable',
    {
      grantee: grantee.id,
      settings,
      valid
    }
  )

  return valid
}

const getMeta = async (args, context) => {
  const isGrantableFlag = await isGrantable(args, context)

  const meta = {
    visible: isGrantableFlag,
    grantable: isGrantableFlag,
    payload: {}
  }

  return meta
}

module.exports = {
  isGrantable,
  getMeta
}
