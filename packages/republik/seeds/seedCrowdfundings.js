const seed = require('./crowdfundings.json')

const gracefulUpsert = (table, logger) => async (data) => {
  try {
    if (data.id) {
      logger(`delete: ${data.id}`)
      await table.delete({ id: data.id })
    }
    logger(`insert: ${JSON.stringify(data)}`)
    await table.insert(data)
  } catch (e) {
    console.error(e.detail)
  }
}

const run = async (pgdb, silent = false) => {
  const logger = silent
    ? () => {}
    : console.log

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

  logger('> seed companies')
  for (const company of seed.companies) {
    await gracefulUpsert(pgdb.public.companies, logger)({
      ...company,
      createdAt: new Date()
    })
  }
  logger('> seed crowdfundings')
  for (const crowdfunding of seed.crowdfundings) {
    await gracefulUpsert(pgdb.public.crowdfundings, logger)({
      ...crowdfunding,
      createdAt: new Date()
    })
  }
  logger('> seed crowdfundingGoals')
  for (const crowdfundingGoal of seed.crowdfundingGoals) {
    await gracefulUpsert(pgdb.public.crowdfundingGoals, logger)({
      ...crowdfundingGoal,
      createdAt: new Date()
    })
  }
  logger('> seed rewards')
  for (const reward of seed.rewards) {
    await gracefulUpsert(pgdb.public.rewards, logger)({
      ...reward,
      createdAt: new Date()
    })
  }
  logger('> seed goodies')
  for (const goodie of seed.goodies) {
    await gracefulUpsert(pgdb.public.goodies, logger)({
      ...goodie,
      createdAt: new Date()
    })
  }
  logger('> seed membershipTypes')
  for (const membershipType of seed.membershipTypes) {
    await gracefulUpsert(pgdb.public.membershipTypes, logger)({
      ...membershipType,
      createdAt: new Date()
    })
  }
  logger('> seed packages')
  for (const _package of seed.packages) {
    await gracefulUpsert(pgdb.public.packages, logger)({
      ..._package,
      createdAt: new Date()
    })
  }
  logger('> seed packageOptions')
  for (const packageOption of seed.packageOptions) {
    await gracefulUpsert(pgdb.public.packageOptions, logger)({
      ...packageOption,
      createdAt: new Date()
    })
  }
}

module.exports = run
