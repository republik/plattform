const debug = require('debug')('crowdfundings:lib:scheduler')
const Redlock = require('redlock')

const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')
const redis = require('@orbiting/backend-modules-base/lib/redis')

const moment = require('moment')

const intervalSecs = 60 * 60 * 24
const lockTtlSecs = 10// 60 * 4 // TODO

const schedulerLock = () => new Redlock([redis])

const { inform: informGivers } = require('./givers')
const { inform: informCancellers } = require('./winbacks')

/**
 * Function to initialize scheduler. Provides scheduling.
 */
const init = async (_context) => {
  debug('init')

  const pgdb = await PgDb.connect()
  const context = {
    ..._context,
    pgdb,
    redis
  }

  /**
   * Default runner, runs every {intervalSecs}.
   * @return {Promise} [description]
   */
  const run = async () => {
    debug('run started')

    try {
      const lock = await schedulerLock().lock('locks:membership-scheduler', 1000 * lockTtlSecs)

      const now = moment()

      await informCancellers({ now }, context)
      // await informGivers({ now }, context)

      // Extend lock for a fraction of usual interval to prevent runner to
      // be executed back-to-back to previous run.
      await lock.extend(1000 * Math.round((lockTtlSecs / 3)))

      debug('run completed')
    } catch (e) {
      if (e.name === 'LockError') {
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
