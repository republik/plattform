const Redlock = require('redlock')
const Promise = require('bluebird')

const moment = require('moment')

const LOCK_RETRY_COUNT = 3
const LOCK_RETRY_DELAY = 600
const LOCK_RETRY_JITTER = 200
const MIN_TTL_MS = LOCK_RETRY_COUNT * (LOCK_RETRY_DELAY + LOCK_RETRY_JITTER)

const init = async ({
  name,
  context,
  runFunc,
  lockTtlSecs,
  runAtTime,
  runAtDaysOfWeek = [1, 2, 3, 4, 5, 6, 7],
  runInitially = false,
  dryRun = false
}) => {
  if (!name || !context || !runFunc || !lockTtlSecs || !runAtTime) {
    console.error(`missing input, scheduler ${name}`, { name, context, runFunc, lockTtlSecs, runAtTime })
    throw new Error(`missing input, scheduler ${name}`)
  }
  if (runAtDaysOfWeek.length < 1) {
    throw new Error('runAtDaysOfWeek must at least have one entry')
  }
  if (dryRun) {
    console.warn(`WARNING: dryRun flag enabled, scheduler "${name}"`)
  }

  const lockKey = `locks:${name}-scheduler`

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
    throw new Error(`lockTtlSecs must be at least ${Math.ceil(MIN_TTL_MS / 1000)})`, { lockTtlSecs })
  }

  let timeout
  const scheduleNextRun = () => {
    const [runAtHour, runAtMinute] = runAtTime.split(':')
    if (!runAtHour || !runAtMinute) {
      throw new Error('invalid runAtTime. Format: HH:MM', { runAtTime })
    }
    const now = moment()
    const nextRunAt = now.clone()
      .hour(runAtHour)
      .minute(runAtMinute)
      .second(0)
      .millisecond(0)
    while (now.isAfter(nextRunAt) || !runAtDaysOfWeek.includes(nextRunAt.isoWeekday())) {
      nextRunAt.add(24, 'hours')
    }
    const nextRunInMs = nextRunAt.diff(now) // ms
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(run, nextRunInMs).unref()
    debug(`next run scheduled ${nextRunAt.fromNow()} at: ${nextRunAt}`)
  }

  const run = async () => {
    try {
      const lock = await redlock().lock(lockKey, 1000 * lockTtlSecs)

      const extendLockInterval = setInterval(
        () =>
          lock.extend(1000 * lockTtlSecs)
            .then(() => { debug('extending lock') })
            .catch(e => { console.warn('extending lock failed', e) }),
        1000 * lockTtlSecs * 0.9
      )

      debug('run started')

      try {
        const now = moment()
        await runFunc({ now, dryRun }, context)
      } catch (e) {
        console.error('scheduled run failed', e)
      } finally {
        // remove interval to extend lock in case runFunc takes longer than
        // initial lock ttl.
        clearInterval(extendLockInterval)
      }

      // wait until other processes exceeded waiting time
      // then give up lock
      await Promise.delay(MIN_TTL_MS * 1.5).then(
        () => lock.unlock()
          .then(() => { debug('unlocked') })
          .catch(e => { console.warn('unlocking failed', e) })
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

  const close = async () => {
    const lock = await redlock().lock(lockKey, 1000 * lockTtlSecs * 2)
    clearTimeout(timeout)
    await lock.unlock()
      .catch((err) => { console.error(err) })
  }

  if (runInitially) {
    debug('run initially')
    await run()
  } else {
    await scheduleNextRun()
  }

  return {
    run,
    close
  }
}

module.exports = {
  init
}
