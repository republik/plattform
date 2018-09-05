const CronJob = require('cron').CronJob
const debug = require('debug')('preview:lib:previewSchedulder')
const Redlock = require('redlock')
const Promise = require('bluebird')

const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')
const redis = require('@orbiting/backend-modules-base/lib/redis')

const previewLib = require('./preview')

const cronRange = '*/10 * * * * *'
const cronTimezone = 'Europe/Berlin'
const lockTtlSecs = 5

/**
 * Function to initialize scheduler. Provides scheduling.
 */
const init = async () => {
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

      const requests = await previewLib.findPending(pgdb)

      debug('requests', requests.length)

      if (requests.length > 0) {
        const users = await pgdb.public.users.find({
          id: requests.map(request => request.userId)
        })

        debug('users', users.length)

        await Promise.map(
          requests,
          (request) => previewLib.sendNewsletter(request, users, pgdb),
          { concurrency: 5 }
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
    }
  }

  const job = new CronJob(
    cronRange,
    run,
    null,
    false,
    cronTimezone
  )

  job.start()
}

module.exports = {
  init
}

const schedulerLock = () => new Redlock([redis])
