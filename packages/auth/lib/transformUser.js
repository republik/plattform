const { nameUtil } = require('@orbiting/backend-modules-utils')

module.exports = (user, additionalFields = {}) => {
  if (!user) {
    return null
  }
  const name = nameUtil.getName(user)
  return {
    // default public fields
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    name,
    initials: nameUtil.getInitials(name),
    hasPublicProfile: user.hasPublicProfile,
    // api read access protected by a resolver functions
    roles: user.roles || [],
    email: user.email,
    // use resolver functions to access _raw
    // and expose more fields according to custom logic
    _raw: user,
    ...additionalFields
  }
}
