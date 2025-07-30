import type { GraphqlContext } from '@orbiting/backend-modules-types'
import { ContributorsRepo } from '../../../lib/ContributorsRepo'
import { ContributorArgs } from '../../../types'

export = async function contributor(
  _: unknown,
  { id, slug }: ContributorArgs,
  { pgdb }: GraphqlContext,
) {
  // Validate that exactly one of id or slug is provided
  if ((!id && !slug) || (id && slug)) {
    throw new Error('Please provide either id or slug, but not both')
  }

  const repo = new ContributorsRepo(pgdb)

  const contributor = await repo.findContributorByIdOrSlug({id, slug})

  if (!contributor) {
    return null
  }

  return contributor
}
