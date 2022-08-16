import { ParsedUrlQuery } from 'querystring'

/**
 * Get the repoId from an owner and repo
 * @param query
 */
export function getRepoIdFromQuery(query: ParsedUrlQuery): string {
  const owner = query.owner
  const repo = query.repo
  return `${owner}/${repo}`
}

/**
 * Get the owner and repo from a repoId
 * @param repoId
 */
export function getQueryFromRepoId(repoId: string): ParsedUrlQuery {
  const [owner, repo] = repoId.split('/')
  return { owner, repo }
}
