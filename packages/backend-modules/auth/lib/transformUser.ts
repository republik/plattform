import { User, UserRow } from '@orbiting/backend-modules-types'

const { naming } = require('@orbiting/backend-modules-utils')

export = (user: UserRow | User, additionalFields = {}): User | null => {
  if (!user) {
    return null
  }
  if ('_raw' in user) {
    return {
      ...(user as User),
      ...additionalFields,
    }
  }
  const name = naming.getName(user)
  return {
    // default public fields
    id: user.id,
    username: user.username,
    slug: user.username || user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    name,
    initials: naming.getInitials(name),
    hasPublicProfile: user.hasPublicProfile,
    // api read access protected by a resolver functions
    roles: user.roles || [],
    email: user.email,
    verified: user.verified,
    // use resolver functions to access _raw
    // and expose more fields according to custom logic
    _raw: user,
    ...additionalFields,
  }
}
