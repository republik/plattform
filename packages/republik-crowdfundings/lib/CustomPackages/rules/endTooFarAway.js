const debug = require('debug')('crowdfundings:lib:CustomPackages:rule:endTooFarAway')

const { getLastEndDate } = require('../../utils')

const HORIZON_MONTHS = 4

module.exports = ({ package_, packageOption, membership, payload, now }) => {
  const activeMembership = package_.user.memberships.find(m => m.active)
  if (!activeMembership) {
    debug('no active membership. rule does not pass.')
    return false
  }

  const endDate = getLastEndDate(activeMembership.membershipPeriods)
  const horizon = now.clone().add(HORIZON_MONTHS, 'months')

  // Check if membership end date is beyond horizon
  if (endDate > horizon) {
    debug(
      'active membership ends beyond horizon: %s (horizon: %s). rule passes.',
      endDate.toISOString(),
      horizon.toISOString()
    )
    return true
  }

  debug(
    'active membership ends too soon: %s (horizon: %s). rule does not pass.',
    endDate.toISOString(),
    horizon.toISOString()
  )
  return false
}
