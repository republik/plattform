const filterMissingRole = ({ roles, visibleToRoles }) =>
  !visibleToRoles?.length ||
  !!visibleToRoles?.some((role) => roles?.includes(role))

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
