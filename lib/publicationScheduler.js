const CronJob = require('cron').CronJob
const Redlock = require('redlock')
const { lib: { redis } } = require('backend-modules-base')
const {
  upsertRef,
  deleteRef
} = require('./github')

const lockKey = 'locks:scheduling'
const ttl = 2000
const channelKey = 'scheduling'
let subClient
let nextJob

const compactArray = (array) => {
  let newArray = []
  for (let i = 0; i < array.length; i += 2) {
    newArray.push({
      value: array[i],
      score: parseInt(array[i + 1])
    })
  }
  return newArray
}

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

const run = async (_lock) => {
  const lock = _lock || await redlock().lock(lockKey, ttl)

  const nextPublication = await redis.zrangeAsync('repos:scheduledIds', 0, 1, 'WITHSCORES')
    .then(objs => compactArray(objs).shift())

  if (nextPublication) {
    const now = new Date().getTime()
    const timeDiff = nextPublication.score - now
    if (timeDiff < 10000) { // max 10sec early
      const key = nextPublication.value
      const repoId = key.split(':').pop().split('/').slice(0, 2).join('/')
      const ref = key.split('/').pop()
      console.log(`scheduler: publishing ${key}`)

      const newRef = ref.replace('scheduled-', '')
      const newKeys = [ `repos:${repoId}/${newRef}` ]
      const newRefs = [ newRef ]
      if (newRef === 'publication') { // prepublication moves along with publication
        newKeys.push(`repos:${repoId}/prepublication`)
        newRefs.push(`prepublication`)
      }

      const payload = await redis.getAsync(key)
      const { sha } = JSON.parse(payload)
      await Promise.all([
        ...newKeys.map(_key => redis.setAsync(_key, payload)),
        redis.delAsync(key),
        redis.zremAsync('repos:scheduledIds', key), // remove from queue
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
    .then(objs => compactArray(objs).shift())

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
