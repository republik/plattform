require('dotenv').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const seed = require('./crowdfundings.json')

const gracefulUpsert = (table) => async (data) => {
  try {
    if (data.id) {
      console.log(`delete: ${data.id}`)
      await table.delete({ id: data.id })
    }
    console.log(`insert: ${JSON.stringify(data)}`)
    await table.insert(data)
  } catch (e) {
    console.error(e.detail)
  }
}

const TRUNCATE = false

PgDb.connect().then(async (pgdb) => {
  if (TRUNCATE) {
    try {
      await pgdb.public.packageOptions.truncate({ cascade: true })
      await pgdb.public.packages.truncate({ cascade: true })
      await pgdb.public.membershipTypes.truncate({ cascade: true })
      await pgdb.public.goodies.truncate({ cascade: true })
      await pgdb.public.rewards.truncate({ cascade: true })
      await pgdb.public.crowdfundingGoals.truncate({ cascade: true })
      await pgdb.public.crowdfundings.truncate({ cascade: true })
      await pgdb.public.companies.truncate({ cascade: true })
    } catch (e) {
      console.error(e)
    }
  }

  console.log('> seed companies')
  for (const company of seed.companies) {
    await gracefulUpsert(pgdb.public.companies)({
      ...company,
      createdAt: new Date()
    })
  }
  console.log('> seed crowdfundings')
  for (const crowdfunding of seed.crowdfundings) {
    await gracefulUpsert(pgdb.public.crowdfundings)({
      ...crowdfunding,
      createdAt: new Date()
    })
  }
  console.log('> seed crowdfundingGoals')
  for (const crowdfundingGoal of seed.crowdfundingGoals) {
    await gracefulUpsert(pgdb.public.crowdfundingGoals)({
      ...crowdfundingGoal,
      createdAt: new Date()
    })
  }
  console.log('> seed rewards')
  for (const reward of seed.rewards) {
    await gracefulUpsert(pgdb.public.rewards)({
      ...reward,
      createdAt: new Date()
    })
  }
  console.log('> seed goodies')
  for (const goodie of seed.goodies) {
    await gracefulUpsert(pgdb.public.goodies)({
      ...goodie,
      createdAt: new Date()
    })
  }
  console.log('> seed membershipTypes')
  for (const membershipType of seed.membershipTypes) {
    await gracefulUpsert(pgdb.public.membershipTypes)({
      ...membershipType,
      createdAt: new Date()
    })
  }
  console.log('> seed packages')
  for (const _package of seed.packages) {
    await gracefulUpsert(pgdb.public.packages)({
      ..._package,
      createdAt: new Date()
    })
  }
  console.log('> seed packageOptions')
  for (const packageOption of seed.packageOptions) {
    await gracefulUpsert(pgdb.public.packageOptions)({
      ...packageOption,
      createdAt: new Date()
    })
  }
}).then(() => {
  process.exit()
}).catch(e => {
  console.error(e)
  process.exit(1)
})
