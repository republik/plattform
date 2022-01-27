import { PgTable } from 'pogi'

import createDataLoader from '@orbiting/backend-modules-dataloader'
import { GraphqlContext } from '@orbiting/backend-modules-types'

export interface Repo {
  id: string
  meta: any
  currentPhase: string
  createdAt: Date
  updatedAt: Date
  archivedAt?: Date
}

export default module.exports = function (context: GraphqlContext) {
  const repos: PgTable<Repo> = context.pgdb.publikator.repos
  return {
    byId: createDataLoader(function (ids: readonly string[]) {
      return repos.find({ id: ids }, { orderBy: { updatedAt: 'desc' } })
    }),
  }
}
