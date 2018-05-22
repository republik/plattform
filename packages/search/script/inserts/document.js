const redis = require('@orbiting/backend-modules-base/lib/redis')
const mdastToString = require('mdast-util-to-string')

const {
  lib: { meta: { getStaticMeta } }
} = require('@orbiting/backend-modules-documents')
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

const { mdastFilter } = require('../../lib/utils.js')

const uuid = require('uuid/v4')

const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY
} = process.env

const sanitizeCommitDoc = (d, indexType = 'Document') => {
  const meta = {
    ...d.content.meta,
    ...getStaticMeta(d)
  }
  const seriesMaster = typeof meta.series === 'string'
    ? meta.series
    : null
  const series = typeof meta.series === 'object'
    ? meta.series
    : null
  if (series) {
    series.episodes.forEach(e => {
      if (e.publishDate === '') {
        e.publishDate = null
      }
    })
  }
  return {
    id: d.id, // Buffer.from(`repo:${repoId}:${commitId}`).toString('base64')
    __type: indexType,

    content: d.content,
    contentString: mdastToString(
      mdastFilter(
        d.content,
        node => node.type === 'code'
      )
    ),
    meta: {
      ...meta,
      repoId: d.repoId,
      series,
      seriesMaster
    }
  }
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

module.exports = async ({indexName, type: indexType, elastic, pgdb}) => {
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
      const { commit, meta: { scheduledAt: _scheduledAt } } = publication
      const scheduledAt = _scheduledAt && _scheduledAt > now
        ? _scheduledAt
        : null

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
      doc.content.meta.prepublication = publication.name.indexOf('prepublication') > -1

      await elastic.create({
        id: uuid(),
        index: indexName,
        type: indexType,
        body: {
          ...sanitizeCommitDoc(doc, indexType)
        }
      })
      stats[indexType].added++
    }
  })

  clearInterval(statsInterval)

  console.log(indexName, stats)
}
