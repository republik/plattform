require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const Promise = require('bluebird')
const dayjs = require('dayjs')
const yargs = require('yargs')

const argv = yargs.options('dry-run', { default: true }).argv

PgDb.connect()
  .then(async (pgdb) => {
    const { dryRun } = argv

    console.log(
      'running script to add temporary 1 month access grants for each climate lab user...',
    )

    const climateAccessGrants = await pgdb.public.accessGrants.find({
      accessCampaignId: '3684f324-b694-4930-ad1a-d00a2e00934b',
      invalidatedAt: null,
    })

    console.log(`${climateAccessGrants.length} climate access grants found...`)

    if (dryRun) {
      console.log('dryRun: will not insert rows')
      console.log(`rows will look like this: `)
      const grant = climateAccessGrants[0]

      console.log({
        accessCampaignId: 'f35c2fcf-c254-482e-b4fb-5c51a48a13d2', // temporary campaign
        granterUserId: grant.granterUserId,
        recipientUserId: grant.recipientUserId,
        beginAt: grant.beginAt,
        endAt: dayjs(grant.beginAt).add(1, 'month'), // +1 month
        beginBefore: grant.beginBefore,
      })
    } else {
      await Promise.map(
        climateAccessGrants,
        async (grant) => {
          const existingGrant = await pgdb.public.accessGrants.findFirst({
            accessCampaignId: 'f35c2fcf-c254-482e-b4fb-5c51a48a13d2', // temporary campaign
            granterUserId: grant.granterUserId,
            recipientUserId: grant.recipientUserId,
            beginAt: grant.beginAt,
          })

          if (!existingGrant) {
            const result = await pgdb.public.accessGrants.insertAndGet({
              accessCampaignId: 'f35c2fcf-c254-482e-b4fb-5c51a48a13d2', // temporary campaign
              granterUserId: grant.granterUserId,
              recipientUserId: grant.recipientUserId,
              beginAt: grant.beginAt,
              endAt: dayjs(grant.beginAt).add(1, 'month'), // +1 month
              beginBefore: grant.beginBefore,
            })
            console.log(
              `row ${result.id} inserted for user ${result.recipientUserId}`,
            )
          } else {
            console.log(
              `record for user ${grant.recipientUserId} already found. No row inserted`,
            )
          }
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
