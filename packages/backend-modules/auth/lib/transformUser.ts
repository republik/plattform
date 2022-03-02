import { UserRow } from '../loaders/User'

const naming = require('@orbiting/backend-modules-utils/naming')

export interface UserTransformed {
  id: string
  username: string
  firstName: string
  lastName: string
  name: string
  initials: string
  hasPublicProfile: boolean
  // api read access protected by a resolver functions
  roles: string[]
  email: string
  // use resolver functions to access _raw
  // and expose more fields according to custom logic
  _raw: UserRow
  [key: string]: any
}

const transformUser = (user: UserRow | UserTransformed, additionalFields = {}): UserTransformed | null => {
  if (!user) {
    return null
  }
  if ('_raw' in user) {
    return {
      ...(user as UserTransformed),
      ...additionalFields,
    }
  }
  const name = naming.getName(user)
  return {
    // default public fields
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    name,
    initials: naming.getInitials(name),
    hasPublicProfile: user.hasPublicProfile,
    // api read access protected by a resolver functions
    roles: user.roles || [],
    email: user.email,
    // use resolver functions to access _raw
    // and expose more fields according to custom logic
    _raw: user,
    ...additionalFields,
  }
}

export default transformUser
