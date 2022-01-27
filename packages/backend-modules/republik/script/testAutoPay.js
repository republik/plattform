require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const Redis = require('@orbiting/backend-modules-base/lib/Redis')
const moment = require('moment')
const {
  run: membershipsOwnersHandler,
} = require('@orbiting/backend-modules-republik-crowdfundings/lib/scheduler/owners')

/*
const {
  prolong,
} = require('@orbiting/backend-modules-republik-crowdfundings/lib/AutoPay')
*/

const run = async (email) => {
  const pgdb = await PgDb.connect()
  const redis = Redis.connect()
  const context = {
    pgdb,
    redis,
    mail: {
      sendMembershipOwnerAutoPay: (args) => {
        const { autoPay, payload } = args
        console.log('sendMembershipOwnerAutoPay', { autoPay, payload })
      },
    },
  }

  const me = await pgdb.public.users.findOne({
    email,
  })

  const membership = await pgdb.public.memberships.findOne({
    userId: me.id,
  })

  const period = await pgdb.public.membershipPeriods.findFirst(
    { membershipId: membership.id },
    { orderBy: ['endDate desc'] },
  )

  const beginDate = moment().subtract(1, 'year').subtract(1, 'day')
  const endDate = moment().subtract(1, 'day')

  await pgdb.public.membershipPeriods.update(
    { id: period.id },
    {
      beginDate,
      endDate,
    },
  )

  // clear all caches
  await redis.flushall()

  // direct
  // console.log(await prolong(membership.id, pgdb, redis))

  // via scheduler
  await membershipsOwnersHandler({}, context)

  // clear all caches
  await redis.flushall()
}

const EMAIL = process.argv[2]
if (!EMAIL) {
  console.error(
    'usage: testAutoPay.js <email>\n The account specified by email is expected to have exactly ONE prolongable membership.',
  )
  process.exit(1)
}

run(EMAIL).then(() => process.exit(0))
