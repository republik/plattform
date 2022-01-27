const Promise = require('bluebird')

const {
  document: getDocument,
} = require('@orbiting/backend-modules-publikator/graphql/resolvers/Commit')

const createCache = require('../../lib/cache')
const { getElasticDoc } = require('../Documents')
const { createPublish } = require('../DocumentZones')

const loaderBuilders = {
  ...require('@orbiting/backend-modules-embeds/loaders'),
  ...require('@orbiting/backend-modules-publikator/loaders'),
}

const getContext = (payload) => {
  const loaders = {}
  const context = {
    ...payload,
    loaders,
  }
  Object.keys(loaderBuilders).forEach((key) => {
    loaders[key] = loaderBuilders[key](context)
  })
  return context
}

module.exports = {
  before: () => {},
  insert: async ({ indexName, type: indexType, elastic, pgdb, redis }) => {
    const stats = { [indexType]: { added: 0, total: 0 } }
    const statsInterval = setInterval(() => {
      console.log(indexName, stats)
    }, 1 * 1000)

    const context = getContext({ pgdb, redis })

    const repos = await pgdb.publikator.repos.find(
      { archivedAt: null },
      { orderBy: { updatedAt: 'desc' } },
    )

    await Promise.map(
      repos,
      async function mapRepo(repo) {
        const { id: repoId } = repo

        const milestones = await context.loaders.Milestone.byRepoId.load(repoId)
        const publications = milestones.filter((p) =>
          ['publication', 'prepublication'].includes(p.scope),
        )
        const hasPrepublication = !!publications.find(
          (p) => p.scope === 'prepublication' && p.publishedAt && !p.revokedAt,
        )

        await Promise.each(publications, async (publication) => {
          const {
            commitId,
            name: versionName,
            scope,
            scheduledAt,
            publishedAt,
            revokedAt,
          } = publication

          const doc = await getDocument(
            { id: commitId, repoId },
            { publicAssets: true },
            context,
          )

          doc.content.meta = {
            ...doc.content.meta,
            repoId,
            publishDate: publishedAt || scheduledAt,
          }

          const elasticDoc = getElasticDoc({
            doc,
            commitId,
            versionName,
          })

          const zones = createPublish(elastic, elasticDoc)

          const isPublished = publishedAt && !revokedAt
          const isPrepublished = scope === 'prepublication' && isPublished

          const inserts = await zones.insert({
            published: hasPrepublication
              ? !isPrepublished && isPublished
              : isPublished,
            prepublished: hasPrepublication ? isPrepublished : isPublished,
          })

          stats[indexType].added += inserts
        })
      },
      { concurrency: 10 },
    )

    clearInterval(statsInterval)

    console.log(indexName, stats)
  },
  after: () => {},
  final: async ({ redis }) => createCache(redis).invalidate(),
}
