//
// This script syncs redis with the status quo on github.
//
// usage
// ❯ node script/pullRedis.js --noflush
//

require('dotenv').config()

const { lib: { redis } } = require('@orbiting/backend-modules-base')
const getRepos = require('../graphql/resolvers/_queries/repos')
const { latestPublications: getLatestPublications } = require('../graphql/resolvers/Repo')
const { document: getDocument } = require('../graphql/resolvers/Commit')
const {
  redlock,
  lockKey,
  channelKey: schedulingChannelKey
} = require('../lib/publicationScheduler')

const user = {
  roles: [ 'editor' ]
}
Promise.resolve().then(async () => {
  const noflush = process.argv[2] === '--noflush'
  if (!noflush) {
    await redis.flushdbAsync()
  }

  const now = new Date()

  const repos = await getRepos(null, { first: 100 }, { user, redis })
  const allLatestPublications = await Promise.all(
    repos.map(repo => getLatestPublications(repo))
  )
    .then(arr => arr.filter(arr2 => arr2.length > 0))
  // console.log(util.inspect(allLatestPublications, {depth: null}))

  let redisOps = []

  for (let publications of allLatestPublications) {
    redisOps.push(
      redis.saddAsync('repos:ids', publications[0].repo.id)
    )
    for (let publication of publications) {
      const { repo, commit, sha, meta: { scheduledAt: _scheduledAt } } = publication

      const doc = await getDocument(
        { id: commit.id, repo },
        { oneway: true },
        { user, redis }
      )
      const payload = JSON.stringify({
        doc,
        sha
      })

      const scheduledAt = _scheduledAt && _scheduledAt > now
        ? _scheduledAt
        : null
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
}).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
