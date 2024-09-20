const { hasUserActiveMembership } = require('@orbiting/backend-modules-utils')

const debug = require('debug')('access:lib:constraints:requireActiveMembershipOrSubscription')

/**
 * Constraint checks if granter has an active membership or subscription. If not contraint will fail. Contraint will hinder display of
 * campaign.
 *
 * Story: Only users which bought a certain, still active membership or subscription can grant
 * access to others.
 *
 * @example: {"requireActiveMembershipOrSubscription": {}}
 */


const isGrantable = async (args, context) => {
  const { granter, settings } = args
  const { pgdb } = context

  const hasActiveMembership = await hasUserActiveMembership(granter, pgdb)

  const isGrantable = hasActiveMembership

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
