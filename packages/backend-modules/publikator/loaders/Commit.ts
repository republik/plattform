import { Promise } from 'bluebird'
import { PgTable } from 'pogi'
import { v4 } from 'is-uuid'

import createDataLoader from '@orbiting/backend-modules-dataloader'
import { GraphqlContext } from '@orbiting/backend-modules-types'

const { parse: mdastParse } = require('@republik/remark-preset')
const {
  cache: { create: createCache },
} = require('@orbiting/backend-modules-utils')

export interface Commit {
  id: string
  repoId: string
  parentIds: string[]
  message: string
  type: null | 'mdast' | 'slate'
  content: string
  content__markdown: string
  meta: any
  userId?: string
  author: CommitAuthor
  createdAt: Date
}

interface CommitAuthor {
  name: string
  email: string
}

const fields = [
  'id',
  'repoId',
  'message',
  'meta',
  'userId',
  'author',
  'createdAt',
  'parentIds',
]

const QUERY_CACHE_TTL_SECONDS = 60 * 60 * 24 * 8 // A week and a day

export default module.exports = function (context: GraphqlContext) {
  const commits: PgTable<Commit> = context.pgdb.publikator.commits
  const cache = createCache(
    {
      namespace: 'publikator:cache',
      prefix: 'Commit',
      ttl: QUERY_CACHE_TTL_SECONDS,
    },
    context,
  )

  async function getTransformedByIds(
    ids: readonly string[],
    transform: (commit: Commit) => any,
    name: string,
  ) {
    const cached = await Promise.map(
      ids,
      async (id: string) =>
        (await cache.get(`${id}:transformed:${name}`)) || { _miss: id },
    )

    // missing commit ids
    const missing = cached.filter((c) => c._miss).map((c) => c._miss)

    // fetch missing missing commit ids, if missing
    const contents =
      (missing.length &&
        (await commits.find(
          { id: missing },
          { fields: ['id', 'type', 'content', 'meta', 'content__markdown'] },
        ))) ||
      []
    const transformed = await Promise.map(contents, transform)

    // cache it!
    await Promise.map(transformed, (row) =>
      cache.set(row, `${row.id}:transformed:${name}`),
    )

    return [...cached.filter((m) => !m._miss), ...transformed]
  }

  return {
    byId: createDataLoader(async (ids: readonly string[]) => {
      const commitIds = ids.filter(v4)
      return (
        (commitIds.length &&
          (await commits.find({ id: commitIds }, { fields }))) ||
        []
      )
    }),
    byIdContent: createDataLoader(async (ids: readonly string[]) =>
      getTransformedByIds(
        ids,
        (row) => ({
          id: row.id,
          type: row.type || 'mdast',
          content: {
            ...(row.content || mdastParse(row.content__markdown)),
            meta: row.meta,
          },
        }),
        'content',
      ),
    ),
    byRepoId: createDataLoader(
      (ids: readonly string[]) =>
        commits.find(
          { repoId: ids },
          { fields, orderBy: { createdAt: 'desc' } },
        ),
      null,
      (key, rows) => rows.filter((row) => row.repoId === key),
    ),
    byRepoIdLatest: createDataLoader(
      async (ids: readonly string[]) =>
        commits.query(
          `
            SELECT
              DISTINCT ON ("repoId")
              ${fields.map((f) => `"${f}"`).join(', ')}
            FROM publikator.commits
            WHERE "repoId" = ANY(:ids)
            ORDER BY "repoId", "createdAt" DESC
          `,
          { ids },
        ),
      null,
      (key, rows) => rows.find((row) => row.repoId === key),
    ),
  }
}
