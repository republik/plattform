const { Roles } = require('@orbiting/backend-modules-auth')

module.exports = {
  user: (discussionSuspension, args, context) => {
    const { loaders } = context

    return loaders.User.byId.load(discussionSuspension.userId)
  },
  issuer: (discussionSuspension, args, context) => {
    const { loaders, user: me } = context

    if (
      !discussionSuspension.issuerUserId ||
      !Roles.userIsInRoles(me, ['supporter', 'admin'])
    ) {
      return null
    }

    return loaders.User.byId.load(discussionSuspension.issuerUserId)
  },
}
