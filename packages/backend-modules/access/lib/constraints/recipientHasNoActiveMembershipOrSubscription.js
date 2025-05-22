const { hasUserActiveMembership } = require('@orbiting/backend-modules-utils')

const debug = require('debug')('access:lib:constraints:recipientHasNoActiveMembershipOrSubscription')

/**
 * Constraint checks if recipient has an active membership or subscription. If yes, the contraint will fail. 
 * 
 * Story: Only users who do not have an active membership or subscription can start a trial.
 *
 * @example: {"recipientHasNoActiveMembershipOrSubscription": {}}
 */


const isGrantable = async (args, context) => {
  const { granter, settings } = args
  const { pgdb } = context

  const hasActiveMembership = await hasUserActiveMembership(granter, pgdb)

  const isGrantable = !hasActiveMembership

  debug('isGrantable', {
    granter: granter.id,
    settings,
    isGrantable,
  })

  return isGrantable
}

const getMeta = async (args, context) => {
  const isGrantableFlag = await isGrantable(args, context)

  const meta = {
    visible: isGrantableFlag,
    grantable: isGrantableFlag,
    payload: {},
  }

  return meta
}

module.exports = {
  isGrantable,
  getMeta,
}
