import type { GraphqlContext } from '@orbiting/backend-modules-types'
import Auth from '@orbiting/backend-modules-auth'

const { Roles } = Auth

type ContributorArgs = {
  id: string
}

export = async function contributor(
  _: unknown,
  { id }: ContributorArgs,
  { pgdb, user }: GraphqlContext,
) {
  // Ensure user has appropriate permissions
  Roles.ensureUserIsInRoles(user, ['admin', 'editor', 'producer'])

  const contributor = await pgdb.public.contributors.findOne({ id })
  
  if (!contributor) {
    return null
  }

  return contributor
} 