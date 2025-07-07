import type { GraphqlContext } from '@orbiting/backend-modules-types'
import Auth from '@orbiting/backend-modules-auth'

const { Roles } = Auth

type ContributorArgs = {
  id?: string
  slug?: string
}

export = async function contributor(
  _: unknown,
  { id, slug }: ContributorArgs,
  { pgdb, user }: GraphqlContext,
) {
  // Check if user has permissions to access gender field
  const hasGenderAccess = Roles.userIsInRoles(user, ['admin', 'editor', 'producer'])

  // Validate that exactly one of id or slug is provided
  if ((!id && !slug) || (id && slug)) {
    throw new Error('Please provide either id or slug, but not both')
  }

  const whereClause = id ? { id } : { slug }
  const contributor = await pgdb.public.contributors.findOne(whereClause)
  
  if (!contributor) {
    return null
  }

  if (!hasGenderAccess) {
    delete contributor.gender
  }

  return contributor
} 