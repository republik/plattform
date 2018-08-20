const cron = require('cron')
const debug = require('debug')('access:lib:accessScheduler')
const moment = require('moment')

const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')

const grantsLib = require('./grants')
const membershipsLib = require('./memberships')

const init = async () => {
  debug('init')

  const pgdb = await PgDb.connect()

  const run = async () => {
    debug('run')

    for (const grant of await grantsLib.findUnassigned(pgdb)) {
      const user = await pgdb.public.users.findOne({ email: grant.email })

      if (user) {
        await grantsLib.setRecipient(grant, user, pgdb)
      }
    }

    // Ensure role "member" is set on current grants.
    for (const grant of await grantsLib.findCurrent(pgdb)) {
      // console.log(grant)

      const user =
        await pgdb.public.users.findOne({ id: grant.recipientUserId })

      const hasUserActiveMembership =
        await membershipsLib.hasUserActiveMembership(user, pgdb)

      // User does not have an active membershop and neither is the member
      // role set. In that case: Add "member" role.
      if (
        user &&
        !hasUserActiveMembership &&
        (!user.roles || !user.roles.includes('member'))
      ) {
        const roles = ['member'].concat(user.roles).filter(Boolean)

        await pgdb.public.users.update(
          { id: user.id },
          { roles, updatedAt: moment() }
        )

        debug('role "member" was missing, added', user.id, roles)
      }
    }

    for (const grant of await grantsLib.findExpired(pgdb)) {
      const user =
        await pgdb.public.users.findOne({ id: grant.recipientUserId })

      const hasUserActiveMembership =
        await membershipsLib.hasUserActiveMembership(user, pgdb)

      if (
        user &&
        !hasUserActiveMembership &&
        user.roles &&
        user.roles.includes('member')
      ) {
        const roles = user.roles.filter(role => role !== 'member')

        await pgdb.public.users.update(
          { id: user.id },
          { roles, updatedAt: moment() }
        )

        debug('role "member" unwarranted, removing', user.id, roles)
      }
    }
  }

  for (const grant of await grantsLib.findRevoked(pgdb)) {
    const user =
      await pgdb.public.users.findOne({ id: grant.recipientUserId })

    const hasUserActiveMembership =
      await membershipsLib.hasUserActiveMembership(user, pgdb)

    if (
      user &&
      !hasUserActiveMembership &&
      user.roles &&
      user.roles.includes('member')
    ) {
      const roles = user.roles.filter(role => role !== 'member')

      await pgdb.public.users.update(
        { id: user.id },
        { roles, updatedAt: moment() }
      )

      debug('role "member" unwarranted, removing', user.id, roles)
    }
  }

  // @TODO: Separate expired from revoked

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
