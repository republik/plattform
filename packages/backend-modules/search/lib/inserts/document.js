const Promise = require('bluebird')

const {
  document: getDocument,
} = require('@orbiting/backend-modules-publikator/graphql/resolvers/Commit')
const {
  prepareMetaForPublish,
} = require('@orbiting/backend-modules-publikator/lib/Document')

const {
  getElasticDoc,
  createPublish,
  findTemplates,
  getResourceUrls,
} = require('../../lib/Documents')

const createCache = require('../../lib/cache')

const loaderBuilders = {
  ...require('@orbiting/backend-modules-auth/loaders'),
  ...require('@orbiting/backend-modules-discussions/loaders'),
  ...require('@orbiting/backend-modules-documents/loaders'),
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

const upsertResolvedMeta = ({ indexName, entities, type, elastic }) => {
  return Promise.mapSeries(entities, async (entity) => {
    const repoName = entity.meta.repoId.split('/').slice(-1)

    const result = await elastic
      .updateByQuery({
        index: indexName,
        refresh: true,
        body: {
          script: {
            lang: 'painless',
            source: `if (!ctx._source.containsKey("resolved")) {
            ctx._source.resolved = new HashMap()
          }

          if (!ctx._source.resolved.containsKey("meta")) {
            ctx._source.resolved.meta = new HashMap()
          }

          ctx._source.resolved.meta.${type} = params.entity`,
            params: {
              entity,
            },
          },
          query: {
            bool: {
              filter: {
                terms: {
                  [`meta.${type}`]: getResourceUrls(repoName),
                },
              },
            },
          },
        },
      })
      .catch((e) => {
        console.log(entity, repoName, type, e.meta?.body?.failures)
        return []
      })

    if (result.failures?.length > 0) {
      console.error(entity.repoId, result.failures)
    }
  })
}

const after = async ({ indexName, elastic }) => {
  const dossiers = await findTemplates(elastic, 'dossier')
  await upsertResolvedMeta({
    indexName,
    entities: dossiers,
    // type: 'dossier',
    elastic,
  })

  const formats = await findTemplates(elastic, 'format')
  await upsertResolvedMeta({
    indexName,
    entities: formats,
    // type: 'format',
    elastic,
  })

  const sections = await findTemplates(elastic, 'section')
  await upsertResolvedMeta({
    indexName,
    entities: sections,
    // type: 'section',
    elastic,
  })
}

module.exports = {
  before: () => {},
  insert: async ({ indexName, type: indexType, elastic, pgdb, redis }) => {
    const stats = { [indexType]: { added: 0, total: 0 } }
    const statsInterval = setInterval(() => {
      console.log(indexName, stats)
    }, 1 * 1000)

    const now = new Date()
    const context = getContext({ pgdb, redis })

    const repos = await pgdb.publikator.repos.find(
      { archivedAt: null },
      { orderBy: { updatedAt: 'desc' } },
    )

    await Promise.all(
      repos,
      async function mapRepo(repo) {
        const { id: repoId, meta: repoMeta } = repo
        const publications = await pgdb.publikator.milestones.find({
          repoId,
          scope: ['publication', 'prepublication'],
          revokedAt: null,
        })

        stats[indexType].total += publications.length

        const hasPrepublication = !!publications.find(
          (p) => p.scope === 'prepublication',
        )

        await Promise.each(
          publications,
          async function mapPublication(publication) {
            const doc = JSON.parse(
              JSON.stringify(
                await getDocument(
                  { id: publication.commitId, repoId: publication.repoId },
                  { publicAssets: true },
                  context,
                ),
              ),
            )

            const scheduledAt = publication.scheduledAt
            const isScheduled = !publication.publishedAt
            const isPrepublication = publication.scope === 'prepublication'
            const lastPublishedAt = scheduledAt || publication.publishedAt

            // prepareMetaForPublish creates missing discussions as a side-effect
            doc.content.meta = await prepareMetaForPublish({
              repoId,
              repoMeta,
              scheduledAt,
              lastPublishedAt,
              prepublication: isPrepublication,
              doc,
              now,
              context,
            })

            const elasticDoc = await getElasticDoc({
              indexName,
              indexType,
              doc,
              commitId: publication.commitId,
              versionName: publication.name,
            })

            const publish = createPublish({
              prepublication: isPrepublication,
              scheduledAt: isScheduled ? scheduledAt : undefined,
              hasPrepublication,
              elastic,
              elasticDoc,
            })

            await publish.insert()

            stats[indexType].added++
          },
        )
      },
      { concurrency: 10 },
    )

    clearInterval(statsInterval)

    console.log(indexName, stats)
  },
  after,
  final: async ({ redis }) => createCache(redis).invalidate(),
}
