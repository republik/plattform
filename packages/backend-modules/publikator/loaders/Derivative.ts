import { PgTable } from 'pogi'

import createDataLoader from '@orbiting/backend-modules-dataloader'
import { GraphqlContext } from '@orbiting/backend-modules-types'

export interface DerivativeRow {
  id: string
  commitId?: string
  type: 'SyntheticReadAloud'
  status: 'Pending' | 'Ready' | 'Failure' | 'Destroyed'
  result?: any
  userId?: string
  author: DerivativeAuthor
  createdAt: Date
  updatedAt: Date
  readyAt?: Date
  failedAt?: Date
  destroyedAt?: Date
}
interface DerivativeAuthor {
  name: string
  email: string
}

export default module.exports = function (context: GraphqlContext) {
  const derivatives: PgTable<DerivativeRow> =
    context.pgdb.publikator.derivatives
  const cache: boolean = context.scope === 'request'
  return {
    byId: createDataLoader(
      (ids: readonly string[]) =>
        derivatives.find({ id: ids }, { orderBy: { createdAt: 'desc' } }),
      { cache },
    ),
    byCommitId: createDataLoader(
      (ids: readonly string[]) =>
        derivatives.find({ commitId: ids }, { orderBy: { createdAt: 'desc' } }),
      { cache },
      (key, rows) => rows.filter((row) => row.commitId === key),
    ),
  }
}
