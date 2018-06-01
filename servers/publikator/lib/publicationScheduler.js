const CronJob = require('cron').CronJob
const Redlock = require('redlock')
const redis = require('@orbiting/backend-modules-base/lib/redis')
const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')
const { handleRedirection } = require('./Document')
const zipArray = require('./zipArray')
const {
  upsertRef,
  deleteRef
} = require('./github')

let subClient
let nextJob

const init = async () => {
  if (subClient) {
    throw new Error('publicationScheduler must not be initiated twice!')
  }

  await refresh()

  subClient = redis.duplicate()
  subClient.on('message', async (channel, message) => {
    if (message === 'refresh') {
      await refresh()
    }
  })
  await subClient.subscribeAsync(channelKey)
}

const quit = async () => {
  if (subClient) {
    await subClient.unsubscribeAsync()
    await subClient.quit()
  }
  if (nextJob) {
    nextJob.stop()
    nextJob = null
  }
}

const maxQuery = {
  size: 1,
  body: {
    query: {
      bool: {
        must: [
          {
            term: {
              __type: "Document"
            }
          }
        ]
      }
    },
    aggs: {
      scheduledAt: {
        max: {
          field: "meta.scheduledAt"
        }
      }
    }
  }
}

const run = async (_lock) => {
  const pgdb = await PgDb.connect()

  const nextPublication = await elastic.search(maxQuery)

  if (nextPublication) {
    const now = new Date().getTime()
    const timeDiff = new Date(nextPublication.meta.scheduledAt) - now
    if (timeDiff < 10000) { // max 10sec early
      // repos:republik/article-briefing-aus-bern-14/scheduled-publication
      const repoId = nextPublication.meta.repoId
      const ref = `scheduled-${nextPublication.meta.prepublication ? 'prepublication' : 'publication'}`
      console.log(`scheduler: publishing ${repoId}`)

      const newRef = ref.replace('scheduled-', '')
      const newRefs = [ newRef ]
      ///////////////////////////////
      const {
        lib: {
          Documents: { createPublish, getElasticDoc },
          utils: { getIndexAlias }
        }
      } = require('@orbiting/backend-modules-search')

      const indexType = 'Document'
      const elasticDoc = getElasticDoc({
        indexName: getIndexAlias(indexType.toLowerCase(), 'write'),
        indexType: indexType,
        doc,
        commitId,
        versionName
      })
      const publish = createPublish({prepublication, scheduledAt, elastic, elasticDoc})
      //////////////////////////////

      if (newRef === 'publication') {
        await handleRedirection(repoId, doc.content.meta, { redis, pgdb })
      }
      await Promise.all([
        publish.afterScheduled()
        ...newRefs.map(_ref =>
          upsertRef(
            repoId,
            `tags/${_ref}`,
            sha
          )
        ),
        deleteRef(
          repoId,
          `tags/${ref}`,
          true
        )
      ])
        .catch(e => {
          console.error('Error: one or more promises failed:')
          console.error(e)
        })
    } else {
      console.error('Error: publicationScheduler was timed wrong.')
    }
  }

  nextJob = null
  refresh(lock)

  if (!_lock) {
    await lock.unlock().catch((err) => { console.error(err) })
  }
}

const refresh = async (_lock) => {
  const lock = _lock || await redlock().lock(lockKey, ttl)

  const nextPublication = await redis.zrangeAsync('repos:scheduledIds', 0, 1, 'WITHSCORES')
    .then(objs => zipArray(objs).shift())

  if (nextPublication) {
    const now = new Date().getTime()
    const timeDiff = nextPublication.score - now
    if (timeDiff < 10000) { // max 10sec early
      console.log('Found scheduled publication in the past. Publishing now...')
      await run(lock)
    } else {
      const nextScheduledAt = new Date(nextPublication.score)
      if (nextJob && nextJob.nextDate() > nextScheduledAt) {
        nextJob.stop()
        nextJob = null
      }
      if (!nextJob) {
        nextJob = new CronJob(
          nextScheduledAt,
          run,
          null,
          true
        )
      }
    }
  }

  if (!_lock) {
    await lock.unlock().catch((err) => { console.error(err) })
  }
}

module.exports = {
  channelKey,
  init,
  redlock,
  lockKey,
  refresh,
  quit
}
