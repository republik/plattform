const cron = require('cron')
const debug = require('debug')('access:lib:accessScheduler')

const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')

const eventsLib = require('./events')
const grantsLib = require('./grants')
const membershipsLib = require('./memberships')

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
    await grantsLib.renderInvalid(grant, pgdb)
    await eventsLib.log(grant, 'expired', pgdb)

    if (grant.recipientUserId) {
      const user =
        await pgdb.public.users.findOne({ id: grant.recipientUserId })

      if (user) {
        const hasRoleChanged = await membershipsLib.removeMemberRole(
          grant,
          user,
          grantsLib.findByRecipient,
          pgdb
        )

        if (hasRoleChanged) {
          await mail.enforceSubscriptions({
            userId: user.id,
            pgdb
          })
        }
      }
    }
  }
}

const init = async ({ mail }) => {
  debug('init')

  const pgdb = await PgDb.connect()

  const run = async () => {
    debug('run')

    await matchGrants(pgdb, mail)
    await expireGrants(pgdb, mail)
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
