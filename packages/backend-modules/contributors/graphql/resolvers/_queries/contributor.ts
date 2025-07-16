import type { GraphqlContext } from '@orbiting/backend-modules-types'

type ContributorArgs = {
  id?: string
  slug?: string
}

export = async function contributor(
  _: unknown,
  { id, slug }: ContributorArgs,
  { pgdb }: GraphqlContext,
) {
  // Validate that exactly one of id or slug is provided
  if ((!id && !slug) || (id && slug)) {
    throw new Error('Please provide either id or slug, but not both')
  }

  const whereClause = id ? { id } : { slug }
  const contributor = await pgdb.public.contributors.findOne(whereClause)

  if (!contributor) {
    return null
  }

  return contributor
}
