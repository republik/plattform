const debug = require('debug')('access:lib:constraints:requireRole')

const { Roles } = require('@orbiting/backend-modules-auth')

const isGrantable = async (args, context) => {
  const { grantee, settings } = args

  const valid = Roles.userHasRole(grantee, settings.role)

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

  debug('getMeta', args.campaign.name, meta)

  return meta
}

module.exports = {
  isGrantable,
  getMeta
}
