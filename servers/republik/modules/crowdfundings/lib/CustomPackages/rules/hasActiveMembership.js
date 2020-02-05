const debug = require('debug')('crowdfundings:lib:CustomPackages:rule:hasActiveMembership')

module.exports = ({ package_, packageOption, membership, payload, now }) => {
  const activeMembership = package_.user.memberships.find(m => m.active)
  if (!activeMembership) {
    debug('no active membership. rule does not pass.')
    return false
  }

  return true
}
