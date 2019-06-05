const { Roles } = require('@orbiting/backend-modules-auth')

const { DEFAULT_ROLES } = require('../../lib/Redirections')

module.exports = {
  target (redirection) {
    if (!redirection.__pathUrl || !redirection.keepQuery) {
      return redirection.target
    }

    const base = process.env.FRONTEND_BASE_URL || 'http://localhost'
    const pathUrl = redirection.__pathUrl
    const targetUrl = new URL(redirection.target, base)

    if (redirection.keepQuery) {
      pathUrl.searchParams.forEach((value, name) => targetUrl.searchParams.set(name, value))
    }

    return targetUrl.toString().replace(base, '')
  },
  resource (redirection, args, { user }) {
    if (!Roles.userIsInRoles(user, DEFAULT_ROLES)) {
      return null
    }

    return redirection.resource
  }
}
