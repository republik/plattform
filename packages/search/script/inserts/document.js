const redis = require('@orbiting/backend-modules-base/lib/redis')
const _ = require('lodash')

// TODO require from servers is not the idea in packages
const getRepos = require('../../../../servers/publikator/graphql/resolvers/_queries/repos')
const {
  latestPublications: getLatestPublications,
  meta: getRepoMeta
} = require('../../../../servers/publikator/graphql/resolvers/Repo')
const { document: getDocument } = require('../../../../servers/publikator/graphql/resolvers/Commit')
const { prepareMetaForPublish } = require('../../../../servers/publikator/lib/Document')
const { lib: {
  Repo: { uploadImages }
} } = require('@orbiting/backend-modules-assets')

const { getElasticDoc, createPublish, findTemplates, getResourceUrls } = require('../../lib/Documents')

const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY
} = process.env

const upsertResolvedMeta = (
  { indexName, entities, type, elastic }
) => {
  return Promise.all(entities.map(async (entity) => {
    const repoName = entity.meta.repoId.split('/').slice(-1)

    const result = await elastic.updateByQuery({
      index: indexName,
      refresh: true,
      body: {
        script: {
          lang: 'painless',
          source:
            `if (!ctx._source.containsKey("resolved")) {
              ctx._source.resolved = new HashMap()
            }

            if (!ctx._source.resolved.containsKey("meta")) {
              ctx._source.resolved.meta = new HashMap()
            }

            ctx._source.resolved.meta.${type} = params.entity`,
          params: {
            entity
          }
        },
        query: {
          bool: {
            filter: {
              terms: {
                [`meta.${type}`]: getResourceUrls(repoName)
              }
            }
          }
        }
      }
    })

    if (result.failures.length > 0) {
      console.error(entity.repoId, result.failures)
    }
  }))
}

const after = async ({indexName, type: indexType, elastic, pgdb}) => {
  const dossiers = await findTemplates(elastic, 'dossier')
  await upsertResolvedMeta(
    { indexName, entities: dossiers, type: 'dossier', elastic }
  )

  const formats = await findTemplates(elastic, 'format')
  await upsertResolvedMeta(
    { indexName, entities: formats, type: 'format', elastic }
  )
}

const iterateRepos = async (context, callback) => {
  let pageInfo
  let pageCounter = 1
  do {
    console.info(`requesting repos (page ${pageCounter}) ...`)
    pageCounter += 1
    const repos = await getRepos(null, {
      first: 20,
      orderBy: {
        field: 'PUSHED_AT',
        direction: 'DESC'
      },
      ...(pageInfo && pageInfo.hasNextPage)
        ? { after: pageInfo.endCursor }
        : { }
    }, context)
    pageInfo = repos.pageInfo
    const allLatestPublications = await Promise.all(
      repos.nodes
        .filter(repo => !repo.isArchived)
        .map(repo => getLatestPublications(repo))
    )
      .then(arr => arr.filter(arr2 => arr2.length > 0))

    for (let publications of allLatestPublications) {
      const repo = repos.nodes.find(r => r.id === publications[0].repo.id)
      const repoMeta = await getRepoMeta(repo)
      await callback(repo, repoMeta, publications)
    }
  } while (pageInfo && pageInfo.hasNextPage)
}

module.exports = {
  before: () => {},
  insert: async ({indexName, type: indexType, elastic, pgdb}) => {
    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      console.warn('missing AWS_ACCESS_KEY_ID and/or AWS_SECRET_ACCESS_KEY skipping image uploads!')
    }

    const stats = { [indexType]: { added: 0, total: 0 } }
    const statsInterval = setInterval(
      () => { console.log(indexName, stats) },
      1 * 1000
    )

    const now = new Date()
    const context = {
      redis,
      pgdb,
      user: {
        name: 'publikator-pullelasticsearch',
        email: 'ruggedly@republik.ch',
        roles: [ 'editor' ]
      }
    }

    await iterateRepos(context, async (repo, repoMeta, publications) => {
      if (repoMeta && repoMeta.mailchimpCampaignId) {
        await redis.setAsync(
          `repos:${repo.id}/mailchimp/campaignId`,
          repoMeta.mailchimpCampaignId,
          'EX', redis.__defaultExpireSeconds
        )
      }

      stats[indexType].total += publications.length

      const hasPrepublication = !!_.find(
        publications,
        { refName: 'prepublication' }
      )

      for (let publication of publications) {
        const {
          commit,
          meta: { scheduledAt },
          refName,
          name: versionName
        } = publication

        const isPrepublication = refName.indexOf('prepublication') > -1
        const isScheduled = refName.indexOf('scheduled') > -1

        const doc = await getDocument(
          { id: commit.id, repo },
          { publicAssets: true },
          context
        )

        // upload images to S3
        if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY) {
          await uploadImages(repo.id, doc.repoImagePaths)
        }

        // prepareMetaForPublish creates missing discussions as a side-effect
        doc.content.meta = await prepareMetaForPublish({
          repoId: repo.id,
          repoMeta,
          scheduledAt,
          prepublication: isPrepublication,
          doc,
          now,
          context
        })

        const elasticDoc = getElasticDoc({
          indexName,
          indexType,
          doc,
          commitId: commit.id,
          versionName,
          milestoneCommitId: publication.sha
        })

        const publish = createPublish({
          prepublication: isPrepublication,
          scheduledAt: isScheduled ? scheduledAt : undefined,
          hasPrepublication,
          elastic,
          elasticDoc
        })

        await publish.insert()

        stats[indexType].added++
      }
    })

    clearInterval(statsInterval)

    console.log(indexName, stats)
  },
  after
}
