import { PgTable } from 'pogi'

import createDataLoader from '@orbiting/backend-modules-dataloader'
import { GraphqlContext } from '@orbiting/backend-modules-types'

interface MemoRow {
  id: string
  repoId: string
  parentIds: string[]
  content: string
  userId?: string
  author: MemoRowAuthor
  published: boolean
  commitId?: string
  createdAt: Date
  updatedAt: Date
}

interface MemoRowAuthor {
  name: string
  email: string
}

export default module.exports = function (context: GraphqlContext) {
  const memos: PgTable<MemoRow> = context.pgdb.publikator.memos
  return {
    byId: createDataLoader((ids: readonly string[]) =>
      memos.find({ id: ids }, { orderBy: { createdAt: 'desc' } }),
    ),
    byRepoId: createDataLoader(
      (ids: readonly string[]) =>
        memos.find({ repoId: ids }, { orderBy: { createdAt: 'desc' } }),
      null,
      (key, rows) => rows.filter((row) => row.repoId === key),
    ),
  }
}
