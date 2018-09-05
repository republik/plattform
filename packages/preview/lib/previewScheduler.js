const Redlock = require('redlock')
const debug = require('debug')('preview:lib:previewSchedulder')

// const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')
const redis = require('@orbiting/backend-modules-base/lib/redis')

// Interval in which scheduler runs
const intervalSecs = 60

/**
 * Function to initialize scheduler. Provides scheduling.
 */
const init = async () => {
  debug('init')

  // const pgdb = await PgDb.connect()

  /**
   * Default runner, runs every {intervalSecs}.
   * @return {Promise} [description]
   */
  const run = async () => {
    debug('run started')

    try {
      const lock =
        await schedulerLock()
          .lock('locks:preview-scheduler', 1000 * intervalSecs)

      // Extend lock for a fraction of usual interval to prevent runner to
      // be executed back-to-back to previous run.
      await lock.extend(1000 * (intervalSecs / 10))

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

  // An initial run
  await run()
}

module.exports = {
  init
}

const schedulerLock = () => new Redlock([redis])
