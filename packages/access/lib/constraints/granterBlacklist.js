const debug = require('debug')('access:lib:constraints:granterBlacklist')

/**
 * Constraint checks if granter's user ID is in constraint's settings.userIds[].
 * If found, contraint fails. Contraint will hinder display of campaign.
 *
 * Story: A blacklisted granter can't grant access.
 *
 * @example: {"granterBlacklist": {"userIds": ["id1", "id2",... "idn"]}}
 */

const isGrantable = async (args, context) => {
  const { granter, settings } = args

  const valid = !settings.userIds.includes(granter.id)

  debug(
    'isGrantable',
    {
      granter: granter.id,
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
