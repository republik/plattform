require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const Redis = require('@orbiting/backend-modules-base/lib/Redis')
const moment = require('moment')

const {
  prolong,
} = require('@orbiting/backend-modules-republik-crowdfundings/lib/AutoPay')

const run = async (email) => {
  const pgdb = await PgDb.connect()
  const redis = Redis.connect()

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

  const beginDate = moment().subtract(1, 'year')
  const endDate = moment().add(1, 'days')

  await pgdb.public.membershipPeriods.update(
    { id: period.id },
    {
      beginDate,
      endDate,
    },
  )

  console.log(await prolong(membership.id, pgdb, redis))
}

const EMAIL = process.argv[2]
if (!EMAIL) {
  console.error(
    'usage: testAutoPay.js <email>\n The account specified by email is expected to have exactly ONE prolongable membership.',
  )
  process.exit(1)
}

run(EMAIL).then(() => process.exit(0))
