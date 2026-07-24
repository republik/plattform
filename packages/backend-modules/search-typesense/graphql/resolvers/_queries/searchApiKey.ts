const {
  Roles: { userHasRole },
} = require('@orbiting/backend-modules-auth')

import {
  generateScopedSearchKey,
  SearchCallerTier,
} from '../../../lib/scopedKey'

const getCallerTier = (user: any): SearchCallerTier => {
  if (userHasRole(user, 'admin') || userHasRole(user, 'supporter')) {
    return 'admin'
  }
  if (userHasRole(user, 'member')) {
    return 'member'
  }
  return 'public'
}

module.exports = async (_: unknown, __: unknown, context: any) => {
  const { user } = context

  const { key, expiresAt } = generateScopedSearchKey(getCallerTier(user))

  return { key, expiresAt }
}
