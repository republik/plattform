const debug = require('debug')('preview:lib:previewSchedulder')
const Redlock = require('redlock')

const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')
const redis = require('@orbiting/backend-modules-base/lib/redis')

const previewLib = require('./preview')

const intervalSecs = 60 * 5
const lockTtlSecs = 60 * 4

/**
 * Function to initialize scheduler. Provides scheduling.
 */
const init = async ({ mail }) => {
  debug('init')

  const pgdb = await PgDb.connect()

  /**
   * Default runner, runs every {intervalSecs}.
   * @return {Promise} [description]
   */
  const run = async () => {
    debug('run started')

    try {
      const lock =
        await schedulerLock()
          .lock('locks:preview-scheduler', 1000 * lockTtlSecs)

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
      setTimeout(run, 1000 * (intervalSecs + 1)).unref()
    }
  }

  await run()
}

module.exports = {
  init
}

const schedulerLock = () => new Redlock([redis])
