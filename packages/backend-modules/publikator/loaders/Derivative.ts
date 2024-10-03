import { PgTable } from 'pogi'

import createDataLoader from '@orbiting/backend-modules-dataloader'
import { GraphqlContext } from '@orbiting/backend-modules-types'
import { DerivativeRow } from '../lib/types'



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
