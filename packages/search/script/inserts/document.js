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
const { publicationVersionRegex } = require('../../../../servers/publikator/lib/github')
const { lib: {
  Repo: { uploadImages }
} } = require('@orbiting/backend-modules-assets')

const { getElasticDoc } = require('../../lib/Documents')

const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY
} = process.env

const after = async ({indexName, type: indexType, elastic, pgdb}) => {
  const query = {
    index: indexName,
    size: 10000,
    body: {
      query: {
        bool: {
          must: {
            match_all: {}
          },
          filter: {
            term: {
              'meta.template': 'format'
            }
          }
        }
      }
    }
  }

  const result = await elastic.search(query)

  const formats = result.hits.hits
    .map(doc => _.pick(
      doc._source.meta,
      ['repoId', 'title', 'description']
    ))

  await Promise.all(formats.map(async (format) => {
    const result = await elastic.updateByQuery({
      index: indexName,
      conflicts: 'proceed',
      refresh: true,
      body: {
        script: {
          lang: 'painless',
          source: 'ctx._source.__format=params.format',
          params: {
            format
          }
        },
        query: {
          bool: {
            filter: {
              wildcard: {
                'meta.format': `*${format.repoId.split('/').pop()}`
              }
            }
          }
        }
      }
    })

    if (result.failures.length > 0) {
      console.error(format.repoId, result.failures)
    }
  }))
}

const iterateRepos = async (context, callback) => {
  let pageInfo
  let pageCounter = 1
  do {
    console.info(`requesting repos (page ${pageCounter}) ...`)
    pageCounter += 1
    const repos = await getRepos(null, {
      first: 20,
      ...(pageInfo && pageInfo.hasNextPage)
        ? { after: pageInfo.endCursor }
        : { }
    }, context)
    pageInfo = repos.pageInfo
    const allLatestPublications = await Promise.all(
      repos.nodes.map(repo => getLatestPublications(repo))
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
      // TODO where to save repo global stuff in elastic
      /*
      if (repoMeta && repoMeta.mailchimpCampaignId) {
        redisOps.push(
          redis.setAsync(`repos:${repo.id}/mailchimp/campaignId`, repoMeta.mailchimpCampaignId)
        )
      }
      */
      stats[indexType].total += publications.length
      for (let publication of publications) {
        const { commit, meta: { scheduledAt }, refName, name } = publication
        const prepublication = refName.indexOf('prepublication') > -1

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
        doc.content.meta = await prepareMetaForPublish(
          repo.id,
          doc.content.meta,
          repoMeta,
          scheduledAt,
          now,
          context
        )

        // TODO how to indicate publication type?
        // doc.content.meta.prepublication = publication.name.indexOf('prepublication') > -1
        const versionNumber = parseInt(publicationVersionRegex.exec(name)[1])
        console.log(publication, { meta: doc.content.meta })

        await elastic.index({
          ...getElasticDoc({
            repoId: repo.id,
            doc,
            versionNumber,
            prepublication,
            indexName,
            indexType
          })
        })
        stats[indexType].added++
      }
    })

    clearInterval(statsInterval)

    console.log(indexName, stats)
  },
  after
}
