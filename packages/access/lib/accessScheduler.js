const cron = require('cron')
const debug = require('debug')('access:lib:accessScheduler')

const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')

const eventsLib = require('./events')
const grantsLib = require('./grants')
const membershipsLib = require('./memberships')

const matchGrants = async (pgdb) => {
  for (const grant of await grantsLib.findUnassigned(pgdb)) {
    const user = await pgdb.public.users.findOne({ email: grant.email })

    if (user) {
      await grantsLib.setRecipient(grant, user, pgdb)
      await eventsLib.log(grant, 'matched', pgdb)
      await membershipsLib.addMemberRole(grant, user, pgdb)
    }
  }
}

const expireGrants = async (pgdb) => {
  for (const grant of await grantsLib.findExpired(pgdb)) {
    await grantsLib.renderInvalid(grant, pgdb)
    await eventsLib.log(grant, 'expired', pgdb)

    if (grant.recipientUserId) {
      const user =
        await pgdb.public.users.findOne({ id: grant.recipientUserId })

      if (user) {
        await membershipsLib.removeMemberRole(grant, user, pgdb)
      }
    }
  }
}

const init = async () => {
  debug('init')

  const pgdb = await PgDb.connect()

  const run = async () => {
    debug('run')

    await matchGrants(pgdb)
    await expireGrants(pgdb)
  }

  const job = new cron.CronJob({
    cronTime: '*/10 * * * * *',
    onTick: run,
    start: true
  })

  debug('job', job !== undefined)
}

module.exports = {
  init
}
