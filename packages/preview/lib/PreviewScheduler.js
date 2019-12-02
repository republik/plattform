const debug = require('debug')('preview:lib:previewSchedulder')
const Redlock = require('redlock')

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const Redis = require('@orbiting/backend-modules-base/lib/Redis')

const previewLib = require('./preview')

const intervalSecs = 60 * 5
const lockTtlSecs = 60 * 4

const LOCK_KEY = 'locks:preview-scheduler'
const schedulerLock = (redis) => new Redlock([redis])

/**
 * Function to initialize scheduler. Provides scheduling.
 */
const init = async ({ t, mail }) => {
  debug('init')

  const pgdb = await PgDb.connect()
  const redis = Redis.connect()

  let timeout

  /**
   * Default runner, runs every {intervalSecs}.
   * @return {Promise} [description]
   */
  const run = async () => {
    debug('run started')

    try {
      const lock = await schedulerLock(redis).lock(LOCK_KEY, 1000 * lockTtlSecs)

      const unscheduledRequests = await previewLib.findUnscheduled(pgdb)

      debug('unscheduled requests', unscheduledRequests.length)

      if (unscheduledRequests.length > 0) {
        const users = await pgdb.public.users.find({
          id: unscheduledRequests.map(request => request.userId)
        })

        debug('users', users.length)

        await previewLib.schedule(unscheduledRequests, users, pgdb, mail)
      }

      const voidableRequests = await previewLib.findVoidable(pgdb)

      debug('voidable requests', voidableRequests.length)

      if (voidableRequests.length > 0) {
        const users = await pgdb.public.users.find({
          id: voidableRequests.map(request => request.userId)
        })

        debug('users', users.length)

        await previewLib.expire(voidableRequests, users, pgdb, mail)
      }

      const followupRequests = await previewLib.findEmptyFollowup(pgdb)

      debug('requests to followup', followupRequests.length)

      if (followupRequests.length > 0) {
        const users = await pgdb.public.users.find({
          id: followupRequests.map(request => request.userId)
        })
        debug('users', users.length)

        const memberships = await pgdb.public.memberships.find({
          userId: followupRequests.map(request => request.userId),
          active: true
        })
        debug('memberships', memberships.length)

        const grants = await pgdb.public.accessGrants.find({
          recipientUserId: followupRequests.map(request => request.userId)
        })
        debug('grants', grants.length)

        await previewLib.followup(
          followupRequests,
          users,
          memberships,
          grants,
          pgdb,
          t
        )
      }

      // Extend lock for a fraction of usual interval to prevent runner to
      // be executed back-to-back to previous run.
      await lock.extend(1000 * Math.round((lockTtlSecs / 3)))

      debug('run completed')
    } catch (e) {
      if (e.name === 'LockError') {
        // swallow
        debug('run failed', e.message)
      } else {
        throw e
      }
    } finally {
      // Set timeout slightly off to usual interval
      if (timeout) {
        clearTimeout(timeout)
      }
      timeout = setTimeout(run, 1000 * (intervalSecs + 1)).unref()
    }
  }

  await run()

  const close = async () => {
    const lock = await schedulerLock(redis)
      .lock(LOCK_KEY, 1000 * lockTtlSecs * 2)

    clearTimeout(timeout)
    await PgDb.disconnect(pgdb)

    await lock.unlock()
      .catch((err) => { console.error(err) })
    await Redis.disconnect(redis)
  }

  return {
    close
  }
}

module.exports = {
  init
}
