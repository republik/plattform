const Redlock = require('redlock')

const moment = require('moment')

const LOCK_RETRY_COUNT = 3
const LOCK_RETRY_DELAY = 600
const LOCK_RETRY_JITTER = 200
const MIN_TTL_MS = LOCK_RETRY_COUNT * (LOCK_RETRY_DELAY + LOCK_RETRY_JITTER)

const init = async (
  name,
  context,
  runFunc,
  runAtTime,
  lockTtlSecs,
  runInitially
) => {
  const { redis } = context
  if (!redis) {
    throw new Error('missing redis')
  }
  const debug = require('debug')(`scheduler:${name}`)
  debug('init')

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
    throw new Error(`lockTtlSecs must be at least ${MIN_TTL_MS / 1000}`)
  }

  const scheduleNextRun = () => {
    const [runAtHour, runAtMinute] = runAtTime.split(':')
    if (!runAtHour || !runAtMinute) {
      throw new Error('invalid runAtTime. Format: HH:MM')
    }
    const now = moment()
    const nextRunAt = now.clone()
      .hour(runAtHour)
      .minute(runAtMinute)
      .second(0)
      .millisecond(0)
    if (now.isAfter(nextRunAt)) {
      nextRunAt.add(24, 'hours')
    }
    const nextRunInMs = nextRunAt.diff(now) // ms
    setTimeout(run, nextRunInMs).unref()
    debug(`next run scheduled ${nextRunAt.fromNow()} at: ${nextRunAt}`)
  }

  const run = async () => {
    try {
      const lock = await redlock()
        .lock(`locks:${name}-scheduler`, 1000 * lockTtlSecs)

      debug('run started')

      const now = moment()
      await runFunc({ now }, context)

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
    return scheduleNextRun(true)
  }
}

module.exports = {
  init
}
