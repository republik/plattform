import { PgTable } from 'pogi'

import createDataLoader from '@orbiting/backend-modules-dataloader'
import { GraphqlContext } from '@orbiting/backend-modules-types'

export interface RepoFileRow {
  id: string
  repoId: string
  name: string
  status: string
  createdAt: Date
  updatedAt: Date
  readyAt?: Date
  failedAt?: Date
  destroyedAt?: Date
}

export default module.exports = function (context: GraphqlContext) {
  const files: PgTable<RepoFileRow> = context.pgdb.publikator.files
  return {
    byId: createDataLoader(function (ids: readonly string[]) {
      return files.find({ id: ids })
    }),
    byRepoId: createDataLoader(
      function (ids: readonly string[]) {
        return files.find({ repoId: ids }, { orderBy: { createdAt: 'desc' } })
      },
      null,
      (key, rows) => rows.filter((row) => row.repoId === key),
    ),
  }
}
