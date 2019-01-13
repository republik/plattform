const Redlock = require('redlock')

const LOCK_RETRY_COUNT = 3
const LOCK_RETRY_DELAY = 600
const LOCK_RETRY_JITTER = 200
const MIN_TTL_MS = LOCK_RETRY_COUNT * (LOCK_RETRY_DELAY + LOCK_RETRY_JITTER)

const init = async ({
  name,
  context,
  runFunc,
  lockTtlSecs,
  runIntervalSecs,
  runInitially = false
}) => {
  if (!name || !context || !runFunc || !lockTtlSecs || !runIntervalSecs) {
    throw new Error('missing input', { name, context, runFunc, lockTtlSecs, runIntervalSecs })
  }
  const { redis } = context
  if (!redis) {
    throw new Error('missing redis')
  }
  const debug = require('debug')(`scheduler:${name}`)
  debug('init')

  const scheduleNextRun = () => {
    // Set timeout slightly off to usual interval
    setTimeout(run, 1000 * (runIntervalSecs + 1)).unref()
  }

  const redlock = () => {
    return new Redlock(
      [redis],
      {
        driftFactor: 0.01, // time in ms
        retryCount: LOCK_RETRY_COUNT,
        retryDelay: LOCK_RETRY_DELAY,
        retryJitter: LOCK_RETRY_JITTER
      }
    )
  }

  if (lockTtlSecs * 1000 < MIN_TTL_MS) {
    throw new Error(`lockTtlSecs must be at least ${Math.ceil(MIN_TTL_MS / 1000)})`, { lockTtlSecs })
  }

  const run = async () => {
    try {
      const lock = await redlock()
        .lock(`locks:${name}-scheduler`, 1000 * lockTtlSecs)

      debug('run started')

      await runFunc({}, context)

      // wait until other processes exceeded waiting time
      // then give up lock
      setTimeout(
        () => {
          lock.unlock()
            .then(lock => { debug('unlocked') })
            .catch(e => { console.warn('unlocking failed', e) })
        },
        1.5 * MIN_TTL_MS
      )

      debug('run completed')
    } catch (e) {
      if (e.name === 'LockError') {
        if (e.attempts && e.attempts > LOCK_RETRY_COUNT) {
          debug('give up, others are doing the work:', e.message)
        } else {
          debug('run failed', e.message)
        }
      } else {
        throw e
      }
    } finally {
      scheduleNextRun()
    }
  }

  if (runInitially) {
    debug('run initially')
    return run()
  } else {
    return scheduleNextRun()
  }
}

module.exports = {
  init
}
