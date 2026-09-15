import { GraphqlContext } from '@orbiting/backend-modules-types'

import {
  generateScopedSearchKey,
  SearchCallerTier,
  ScopedSearchKey,
} from '../../../lib/scopedKey'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  Roles: { userHasRole },
} = require('@orbiting/backend-modules-auth')

const getCallerTier = (user: GraphqlContext['user']): SearchCallerTier => {
  if (userHasRole(user, 'admin') || userHasRole(user, 'supporter')) {
    return 'admin'
  }
  if (userHasRole(user, 'member')) {
    return 'member'
  }
  return 'public'
}

export = function searchApiKey(
  _root: never,
  _args: never,
  ctx: GraphqlContext,
): ScopedSearchKey {
  return generateScopedSearchKey(getCallerTier(ctx.user))
}
