const CronJob = require('cron').CronJob
const Redlock = require('redlock')
const debug = require('debug')('publikator:lib:publicationScheduler')
const Redis = require('@orbiting/backend-modules-base/lib/Redis')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const Elasticsearch = require('@orbiting/backend-modules-base/lib/Elasticsearch')
const indices = require('@orbiting/backend-modules-search/lib/indices')
const index = indices.dict.documents
const { getIndexAlias } = require('@orbiting/backend-modules-search/lib/utils')
const { handleRedirection } = require('./Document')
const {
  latestPublications: getLatestPublications,
  meta: getRepoMeta
} = require('../graphql/resolvers/Repo')
const {
  upsertRef,
  deleteRef
} = require('./github')
const { upsert: repoCacheUpsert } = require('./cache/upsert')

const lockKey = 'locks:scheduling'
const ttl = 2000
const channelKey = 'scheduling'

let singleton

const redlock = (redis) =>
  new Redlock(
    [redis],
    {
      driftFactor: 0.01, // time in ms
      retryCount: 10,
      retryDelay: 600,
      retryJitter: 200
    }
  )

const getSchedulableDocuments = async (elastic) => {
  const response = await elastic.search({
    index: getIndexAlias(index.name, 'read'),
    size: 1,
    body: {
      sort: { 'meta.scheduledAt': 'asc' },
      query: {
        bool: {
          must: [
            { term: { __type: 'Document' } },
            { exists: { field: 'meta.scheduledAt' } }
          ]
        }
      }
    }
  })

  return response.hits.hits.map(hit => hit._source)
}

const init = async () => {
  debug('init')

  if (singleton) {
    throw new Error('publicationScheduler must not be initiated twice!')
  }
  singleton = 'init'

  const elastic = await Elasticsearch.connect()
  const redis = await Redis.connect()
  const pgdb = await PgDb.connect()

  const context = { elastic, redis, pgdb }

  // subscribe to messages
  const subClient = await redis.duplicate()
  subClient.on('message', async (channel, message) => {
    debug('incoming', { channel, message })
    if (message === 'refresh') {
      await refresh()
    }
  })
  await subClient.subscribeAsync(channelKey)

  let nextJob

  const run = async (_lock) => {
    const lock = _lock || await redlock(redis).lock(lockKey, ttl)

    const docs = await getSchedulableDocuments(elastic)

    if (docs.length > 0) {
      const doc = docs.shift()

      const delta = new Date(doc.meta.scheduledAt) - new Date()

      debug(
        'publishing...', {
          repoId: doc.meta.repoId,
          versionName: doc.versionName,
          scheduledAt: doc.meta.scheduledAt,
          delta
        }
      )

      if (delta < 10 * 1000) { // max 10sec early
        // repos:republik/article-briefing-aus-bern-14/scheduled-publication
        const repoId = doc.meta.repoId
        const prepublication = doc.meta.prepublication
        const scheduledAt = doc.meta.scheduledAt

        const ref = `scheduled-${prepublication ? 'prepublication' : 'publication'}`
        console.log(`scheduler: publishing ${repoId}`)

        const newRef = ref.replace('scheduled-', '')
        const newRefs = [ newRef ]

        const { lib: { Documents: { createPublish } } } =
          require('@orbiting/backend-modules-search')

        const publish = createPublish({
          prepublication,
          scheduledAt,
          elasticDoc: doc,
          elastic,
          redis
        })

        if (newRef === 'publication') {
          await handleRedirection(repoId, doc.content.meta, { elastic, pgdb })
          newRefs.push('prepublication')
        }

        await Promise.all([
          publish.afterScheduled(),
          ...newRefs.map(_ref =>
            upsertRef(
              repoId,
              `tags/${_ref}`,
              doc.milestoneCommitId
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

        await repoCacheUpsert({
          id: repoId,
          meta: await getRepoMeta({ id: repoId }),
          publications: await getLatestPublications({ id: repoId })
        }, context)

        debug(
          'published', {
            repoId: doc.meta.repoId,
            versionName: doc.versionName,
            scheduledAt: doc.meta.scheduledAt,
            refs: newRefs
          }
        )
      } else {
        console.error('Error: publicationScheduler was timed wrong.')
      }
    }

    nextJob = null
    await refresh(lock)

    if (!_lock) {
      await lock.unlock().catch((err) => { console.error(err) })
    }
  }

  const refresh = async (_lock) => {
    const lock = _lock || await redlock(redis).lock(lockKey, ttl)
    const docs = await getSchedulableDocuments(elastic)

    if (docs.length > 0) {
      const doc = docs.shift()
      const delta = new Date(doc.meta.scheduledAt) - new Date()

      if (delta < 10 * 1000) { // max 10sec early
        console.log('scheduler: unpublished documents found. catching up...')
        await run()
      } else {
        debug(
          'scheduled', {
            repoId: doc.meta.repoId,
            versionName: doc.versionName,
            scheduledAt: doc.meta.scheduledAt
          }
        )

        const nextScheduledAt = new Date(doc.meta.scheduledAt)
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
    } else if (nextJob) {
      debug('no more scheduled documents found. removing scheduled job')

      nextJob.stop()
      nextJob = null
    } else {
      debug('no scheduled documents found')
    }

    if (!_lock) {
      await lock.unlock().catch((err) => { console.error(err) })
    }
  }

  const close = async () => {
    if (nextJob) {
      nextJob.stop()
      nextJob = null
    }

    // wait for job to finish
    const lock = await redlock(redis).lock(lockKey, ttl * 10)

    await subClient.unsubscribeAsync()

    await Promise.all([
      subClient.quit(),
      Elasticsearch.disconnect(elastic),
      PgDb.disconnect(pgdb)
    ])

    await lock.unlock()
      .catch((err) => { console.error(err) })
    await Redis.disconnect(redis)

    singleton = null
  }

  // An initial run
  await refresh()

  return {
    close
  }
}

module.exports = {
  channelKey,
  init
}
