const debug = require('debug')('access:lib:constraints:requireRole')

const { Roles } = require('@orbiting/backend-modules-auth')

/**
 * Checks if user has role set in settings.role. If not, contraint will fail.
 * Constraint will hinder display of campaign.
 *
 * Story: Only users with a certain role should be able to grant access.
 *
 * @example: {"requireRole": {"role": "editor"}}
 */

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

  return meta
}

module.exports = {
  isGrantable,
  getMeta
}
