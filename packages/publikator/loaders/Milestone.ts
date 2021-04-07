import { PgTable } from 'pogi'

import createDataLoader from '@orbiting/backend-modules-dataloader'
import { GraphqlContext } from '@orbiting/backend-modules-types'

interface Milestone {
  id: string
  scope: MilestoneScope
  repoId: string
  commitId: string
  name: string
  meta: any
  userId?: string
  author: MilestoneAuthor
  createdAt: Date
  scheduledAt?: Date
  publishedAt?: Date
  revokedAt?: Date
}

type MilestoneScope = 'publication' | 'prepublication' | 'milestone'

interface MilestoneAuthor {
  name: string
  email: string
}

export default module.exports = function (context: GraphqlContext) {
  const milestones: PgTable<Milestone> = context.pgdb.publikator.milestones
  return {
    byRepoId: createDataLoader(
      (ids: readonly string[]) =>
        milestones.find({ repoId: ids }, { orderBy: { createdAt: 'asc' } }),
      { cache: false },
      (key, rows) => rows.filter((row) => row.repoId === key),
    ),
    Publication: {
      byRepoId: createDataLoader(
        async (ids: readonly string[]) =>
          await milestones.find(
            {
              repoId: ids,
              scope: ['publication', 'prepublication'],
              revokedAt: null,
            },
            { orderBy: { createdAt: 'asc' } },
          ),
        { cache: false },
        (key, rows) => rows.filter((row) => row.repoId === key),
      ),
    },
  }
}
