//
// This script syncs redis with the status quo on github.
//
// usage
// node script/pullRedis.js --flush
//

require('@orbiting/backend-modules-env').config()

const redis = require('@orbiting/backend-modules-base/lib/redis')
const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')
const getRepos = require('../graphql/resolvers/_queries/repos')
const {
  latestPublications: getLatestPublications,
  meta: getRepoMeta
} = require('../graphql/resolvers/Repo')
const { document: getDocument } = require('../graphql/resolvers/Commit')
const {
  redlock,
  lockKey,
  channelKey: schedulingChannelKey
} = require('../lib/publicationScheduler')
const { prepareMetaForPublish } = require('../lib/Document')
const { lib: {
  Repo: { uploadImages }
} } = require('@orbiting/backend-modules-assets')

const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY
} = process.env

PgDb.connect().then(async pgdb => {
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    console.warn('missing AWS_ACCESS_KEY_ID and/or AWS_SECRET_ACCESS_KEY skipping image uploads!')
  }

  const flush = process.argv[2] === '--flush'
  if (flush) {
    console.warn('Flushing redis...')
    await redis.flushdbAsync()
  }

  const now = new Date()
  const context = {
    redis,
    pgdb,
    user: {
      name: 'publikator-pullredis',
      email: 'ruggedly@republik.ch',
      roles: [ 'editor' ]
    }
  }

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

    let redisOps = []

    for (let publications of allLatestPublications) {
      const repo = repos.nodes.find(r => r.id === publications[0].repo.id)
      redisOps.push(
        redis.saddAsync('repos:ids', repo.id)
      )
      const repoMeta = await getRepoMeta(repo)
      if (repoMeta && repoMeta.mailchimpCampaignId) {
        redisOps.push(
          redis.setAsync(`repos:${repo.id}/mailchimp/campaignId`, repoMeta.mailchimpCampaignId)
        )
      }
      for (let publication of publications) {
        const { commit, sha, meta: { scheduledAt: _scheduledAt } } = publication
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
        const payload = JSON.stringify({
          doc,
          sha,
          repoId: repo.id
        })

        let ref = publication.name.indexOf('prepublication') > -1
          ? 'prepublication'
          : 'publication'
        if (scheduledAt) {
          ref = `scheduled-${ref}`
        }

        const key = `repos:${repo.id}/${ref}`
        redisOps.push(
          redis.setAsync(key, payload)
        )
        if (scheduledAt) {
          redisOps.push(
            redis.zaddAsync(`repos:scheduledIds`, scheduledAt.getTime(), key)
          )
        } else {
          if (ref === 'publication') {
            redisOps.push(
              redis.setAsync(`repos:${repo.id}/prepublication`, payload)
            )
          }
        }
      }
    }
    redisOps.push(
      redis.publishAsync(schedulingChannelKey, 'refresh')
    )
    const lock = await redlock().lock(lockKey, 1000)
    await Promise.all(redisOps)
    await lock.unlock()
      .catch((err) => {
        console.error(err)
      })
  } while (pageInfo && pageInfo.hasNextPage)
  console.info('done!')
}
).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
