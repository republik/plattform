const { Roles } = require('@orbiting/backend-modules-auth')

const { DEFAULT_ROLES } = require('../../lib/Redirections')

module.exports = {
  resource(redirection, args, { user }) {
    if (!Roles.userIsInRoles(user, DEFAULT_ROLES)) {
      return null
    }

    return redirection.resource
  },
}
