const Redlock = require('redlock')
const debug = require('debug')('access:lib:accessScheduler')

const campaignsLib = require('./campaigns')
const grantsLib = require('./grants')

// Interval in which scheduler runs
const intervalSecs = 60 * 10

const LOCK_KEY = 'locks:access-scheduler'
const schedulerLock = (redis) => new Redlock([redis])

/**
 * Function to initialize scheduler. Provides scheduling.
 */
const init = async (context) => {
  debug('init')

  const { redis, t, pgdb, mail } = context

  let timeout

  /**
   * Default runner, runs every {intervalSecs}.
   * @return {Promise} [description]
   */
  const run = async () => {
    debug('run started')

    try {
      const lock = await schedulerLock(redis).lock(
        LOCK_KEY,
        1000 * intervalSecs,
      )

      await recommendations(t, pgdb, mail)
      await expireGrants(t, pgdb, mail)
      await followupGrants(t, pgdb, mail)

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
      if (timeout) {
        clearTimeout(timeout)
      }
      timeout = setTimeout(run, 1000 * (intervalSecs + 1)).unref()
    }
  }

  // An initial run
  await run()

  const close = async () => {
    const lock = await schedulerLock(redis).lock(
      LOCK_KEY,
      1000 * intervalSecs * 2,
    )
    clearTimeout(timeout)
    await lock.unlock().catch((err) => {
      console.error(err)
    })
  }

  return {
    close,
  }
}

module.exports = { init }

/**
 * Sends recommendations on current grants (only for campaigns with active recommendations)
 */

const recommendations = async (t, pgdb, mail) => {
  debug('recommendations...')
  const queryConditions = {
    'emailRecommendations !=': null,
  }
  for (const campaign of await campaignsLib.findByConditions(
    pgdb,
    queryConditions,
  )) {
    for (const grant of await grantsLib.findEmptyRecommendations(
      campaign,
      pgdb,
    )) {
      const transaction = await pgdb.transactionBegin()

      try {
        await grantsLib.recommendations(campaign, grant, t, transaction)
        await transaction.transactionCommit()
      } catch (e) {
        await transaction.transactionRollback()

        debug('rollback', { grant: grant.id })

        throw e
      }
    }
  }
  debug('recommendations done')
}

/**
 * Renders expired grants invalid.
 */
const expireGrants = async (t, pgdb, mail) => {
  debug('expireGrants...')
  for (const grant of await grantsLib.findInvalid(pgdb)) {
    const transaction = await pgdb.transactionBegin()

    try {
      await grantsLib.invalidate(grant, 'expired', t, transaction, mail)
      await transaction.transactionCommit()
    } catch (e) {
      await transaction.transactionRollback()

      debug('rollback', { grant: grant.id })

      throw e
    }
  }
  debug('expireGrant done')
}

/**
 * Runs follow-up on invalidated grants.
 */
const followupGrants = async (t, pgdb, mail) => {
  debug('followupGrants...')
  for (const campaign of await campaignsLib.findAll(pgdb)) {
    for (const grant of await grantsLib.findEmptyFollowup(campaign, pgdb)) {
      const transaction = await pgdb.transactionBegin()

      try {
        await grantsLib.followUp(campaign, grant, t, transaction, mail)
        await transaction.transactionCommit()
      } catch (e) {
        await transaction.transactionRollback()

        debug('rollback', { grant: grant.id })

        throw e
      }
    }
  }
  debug('followupGrants done')
}
