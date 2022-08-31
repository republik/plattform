const {
  Roles: { userIsInRoles },
} = require('@orbiting/backend-modules-auth')

const filterMissingRole = ({ roles, visibleToRoles }) =>
  !visibleToRoles?.length || userIsInRoles(roles, visibleToRoles)

const filterInvisible = ({ invisible }) => !invisible

module.exports = {
  subscriptions: (settings, args, context) => {
    const { subscriptions } = settings

    if (args?.name) {
      return subscriptions.filter(({ name }) => name === args.name)
    }

    return subscriptions.filter(filterMissingRole).filter(filterInvisible)
  },
}
