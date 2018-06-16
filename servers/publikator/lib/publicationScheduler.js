const CronJob = require('cron').CronJob
const Redlock = require('redlock')
const debug = require('debug')('publikator:lib:publicationScheduler')
const redis = require('@orbiting/backend-modules-base/lib/redis')
const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')
const Elastic = require('@orbiting/backend-modules-base/lib/elastic')
const indices = require('@orbiting/backend-modules-search/lib/indices')
const { getIndexAlias } = require('@orbiting/backend-modules-search/lib/utils')
const { handleRedirection } = require('./Document')
const {
  upsertRef,
  deleteRef
} = require('./github')

const elastic = Elastic.client()

const lockKey = 'locks:scheduling'
const ttl = 2000
const channelKey = 'scheduling'

let subClient
let nextJob

const redlock = () => {
  return new Redlock(
    [redis],
    {
      driftFactor: 0.01, // time in ms
      retryCount: 10,
      retryDelay: 600,
      retryJitter: 200
    }
  )
}

const init = async () => {
  debug('init')

  if (subClient) {
    throw new Error('publicationScheduler must not be initiated twice!')
  }

  await refresh()

  subClient = redis.duplicate()
  subClient.on('message', async (channel, message) => {
    debug('incoming', { channel, message })
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

const index = indices.dict.documents

const getSchedulableDocuments = async () => {
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

const run = async (_lock) => {
  const lock = _lock || await redlock().lock(lockKey, ttl)

  const pgdb = await PgDb.connect()

  const docs = await getSchedulableDocuments()

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
        elastic,
        elasticDoc: doc
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
  const lock = _lock || await redlock().lock(lockKey, ttl)
  const docs = await getSchedulableDocuments()

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

module.exports = {
  channelKey,
  init,
  redlock,
  lockKey,
  refresh,
  quit
}
