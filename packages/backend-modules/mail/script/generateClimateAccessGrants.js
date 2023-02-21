require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const Promise = require('bluebird')
const dayjs = require('dayjs')
const yargs = require('yargs')

const argv = yargs.options('dry-run', { default: true }).argv

const getAlteredGrant = (grant) => {
  const alteredGrant = {
    ...grant,
    payload: null,
    accessCampaignId: 'f35c2fcf-c254-482e-b4fb-5c51a48a13d2', // temporary campaign
    endAt: dayjs(grant.beginAt)
      .add(1, 'month')
      .add(Math.round(Math.random() * 23), 'hours')
      .add(Math.round(Math.random() * 60), 'minute')
      .toDate(),
  }

  delete alteredGrant.id

  return alteredGrant
}

PgDb.connect()
  .then(async (pgdb) => {
    const { dryRun } = argv

    console.log(
      'running script to add temporary 1 month access grants for each climate lab user...',
    )

    const climateAccessGrants = await pgdb.public.query(`
      SELECT *
      FROM "accessGrants"
      WHERE "accessCampaignId" = '3684f324-b694-4930-ad1a-d00a2e00934b'
        AND "invalidatedAt" IS NULL
        AND "recipientUserId" NOT IN (
          -- Ignore grants of users which we ported to temporary campaign already
          SELECT "recipientUserId"
          FROM "accessGrants"
          WHERE "accessCampaignId" = 'f35c2fcf-c254-482e-b4fb-5c51a48a13d2'
        )

      ORDER BY RANDOM()
      LIMIT 1000
    `)

    console.log(`${climateAccessGrants.length} climate access grants found...`)

    if (dryRun) {
      console.log('dryRun: will not insert rows')
      console.log(`rows will look like this: `)
      const grant = climateAccessGrants[0]

      console.log(getAlteredGrant(grant))
    } else {
      await Promise.map(
        climateAccessGrants,
        async (grant) => {
          const result = await pgdb.public.accessGrants.insertAndGet(
            getAlteredGrant(grant),
          )
          console.log(
            `row ${result.id} inserted for user ${result.recipientUserId}`,
          )
        },
        { concurrency: 20 },
      )
    }

    console.log('finished!')
  })
  .then(() => {
    process.exit()
  })
  .catch((e) => {
    console.log(e)
    process.exit(1)
  })
