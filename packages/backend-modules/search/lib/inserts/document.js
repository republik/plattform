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

const upsertResolvedMeta = async ({
  indexName,
  entities,
  metaType,
  elastic,
}) => {
  const results = []

  for (const entity of entities) {
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

              ctx._source.resolved.meta.${metaType} = params.entity`,
            params: {
              entity,
            },
          },
          query: {
            bool: {
              filter: {
                terms: {
                  [`meta.${metaType}`]: getResourceUrls(repoName),
                },
              },
            },
          },
        },
      })
      .catch((e) => {
        console.log(entity, repoName, metaType, e.meta?.body?.failures)
        return []
      })

    if (result.failures?.length > 0) {
      console.error(entity.repoId, result.failures)
    }

    results.push(result)
  }

  return results
}

const after = async ({ indexName, elastic }) => {
  const dossiers = await findTemplates(elastic, 'dossier')
  await upsertResolvedMeta({
    indexName,
    entities: dossiers,
    metaType: 'dossier',
    elastic,
  })

  const formats = await findTemplates(elastic, 'format')
  await upsertResolvedMeta({
    indexName,
    entities: formats,
    metaType: 'format',
    elastic,
  })

  const sections = await findTemplates(elastic, 'section')
  await upsertResolvedMeta({
    indexName,
    entities: sections,
    metaType: 'section',
    elastic,
  })
}

module.exports = {
  before: () => {},
  insert: async ({ indexName, type: indexType, elastic, pgdb, redis }) => {
    // work around until we updated to node 22 and can work with node esm modules
    const { default: pLimit } = await import('p-limit')

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

    const limit = pLimit(10)

    await limit.map(repos, async function mapRepo(repo) {
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

      for (const publication of publications) {
        const doc = structuredClone(
          await getDocument(
            { id: publication.commitId, repoId: publication.repoId },
            { publicAssets: true },
            context,
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
      }
    })

    clearInterval(statsInterval)

    console.log(indexName, stats)
  },
  after,
  final: async ({ redis }) => createCache(redis).invalidate(),
}
