const Redlock = require('redlock')
const debug = require('debug')('access:lib:accessScheduler')

const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')
const redis = require('@orbiting/backend-modules-base/lib/redis')

const eventsLib = require('./events')
const grantsLib = require('./grants')
const membershipsLib = require('./memberships')

// Interval in which scheduler runs
const intervalSecs = 60

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
          .lock('locks:access-scheduler', 1000 * intervalSecs)

      await expireGrants(pgdb, mail)

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
  await matchGrants(pgdb, mail)
  await run()
}

const signInHook = async (userId, isNew, pgdb, mail) => {
  debug('signInHook', { userId })

  const user = await pgdb.public.users.findOne({ id: userId })
  const grants =
    await grantsLib.findUnassignedByEmail(user.email, pgdb)

  if (grants.length === 0) {
    return null
  }

  for (const grant of grants) {
    await matchGrant(grant, pgdb, mail)
  }
}

module.exports = {
  init,
  signInHook
}

const schedulerLock = () => new Redlock([redis])

/**
 * Matches a grant email addresses to a User.
 */
const matchGrant = async (grant, pgdb, mail) => {
  const user = await pgdb.public.users.findOne({ email: grant.email })

  if (user) {
    await grantsLib.setRecipient(grant, user, pgdb)
    await eventsLib.log(grant, 'matched', pgdb)
    const hasRoleChanged =
      await membershipsLib.addMemberRole(grant, user, pgdb)

    if (hasRoleChanged) {
      await mail.enforceSubscriptions({
        userId: user.id,
        pgdb
      })
    }
  }
}

/**
 * Matches unassignedGrants
 */
const matchGrants = async (pgdb, mail) => {
  for (const grant of await grantsLib.findUnassigned(pgdb)) {
    await matchGrant(grant, pgdb, mail)
  }
}

/**
 * Renders expired grants invalid
 */
const expireGrants = async (pgdb, mail) => {
  for (const grant of await grantsLib.findExpired(pgdb)) {
    await grantsLib.renderInvalid(grant, 'expired', pgdb, mail)
  }
}
