const Redlock = require('redlock')
const debug = require('debug')('access:lib:accessScheduler')

const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')
const redis = require('@orbiting/backend-modules-base/lib/redis')

const eventsLib = require('./events')
const grantsLib = require('./grants')
const membershipsLib = require('./memberships')

const intervalSecs = 10

const schedulerLock = () => new Redlock(
  [redis],
  {
    driftFactor: 0.01,
    retryCount: 1,
    retryDelay: 600,
    retryJitter: 200
  }
)

const matchGrants = async (pgdb, mail) => {
  for (const grant of await grantsLib.findUnassigned(pgdb)) {
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
}

const expireGrants = async (pgdb, mail) => {
  for (const grant of await grantsLib.findExpired(pgdb)) {
    await grantsLib.renderInvalid(grant, 'expired', pgdb, mail)
  }
}

const init = async ({ mail }) => {
  debug('init')

  const pgdb = await PgDb.connect()

  const run = async () => {
    debug('run started')

    try {
      const lock =
        await schedulerLock()
          .lock('locks:access-scheduler', 1000 * intervalSecs)

      await matchGrants(pgdb, mail)
      await expireGrants(pgdb, mail)

      await lock.extend(1000 * 10)

      debug('run completed')
    } catch (e) {
      debug('run failed')
      if (e.name === 'LockError') {
        // swallow
        debug(e.message)
      } else {
        throw e
      }
    } finally {
      setTimeout(run, 1000 * intervalSecs).unref()
    }
  }

  await run()
}

module.exports = {
  init
}
