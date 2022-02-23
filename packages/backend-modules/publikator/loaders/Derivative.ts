import { PgTable } from 'pogi'

import createDataLoader from '@orbiting/backend-modules-dataloader'
import { GraphqlContext } from '@orbiting/backend-modules-types'

interface DerivativeRow {
  id: string
  commitId?: string
  type: string
  settings: string
  status: string
  result: string
  createdAt: Date
  readyAt?: Date
  failedAt?: Date
  destroyedAt?: Date
}

export default module.exports = function (context: GraphqlContext) {
  const derivatives: PgTable<DerivativeRow> =
    context.pgdb.publikator.derivatives
  return {
    byId: createDataLoader((ids: readonly string[]) =>
      derivatives.find({ id: ids }, { orderBy: { createdAt: 'desc' } }),
    ),
    byCommitId: createDataLoader(
      (ids: readonly string[]) =>
        derivatives.find({ commitId: ids }, { orderBy: { createdAt: 'desc' } }),
      null,
      (key, rows) => rows.filter((row) => row.commitId === key),
    ),
  }
}
