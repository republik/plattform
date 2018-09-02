const debug = require('debug')('access:lib:constraints:granteeBlacklist')

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
