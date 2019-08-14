const { Roles } = require('@orbiting/backend-modules-auth')

const {
  activeMembership: getActiveMembership
} = require('../../../../../servers/republik/modules/crowdfundings/graphql/resolvers/User')

module.exports = async ({ minInterval, id }, _, context) => {
  const { user } = context

  const isMember = Roles.userIsInRoles(user, ['member'])
  const hasActiveMembership = !!(await getActiveMembership(user, null, context))

  return isMember && hasActiveMembership
}
