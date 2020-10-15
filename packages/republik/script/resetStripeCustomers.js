require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const {
  resetCustomers,
} = require('@orbiting/backend-modules-republik-crowdfundings/__tests__/stripeHelpers')

const run = async () => {
  const pgdb = await PgDb.connect()
  await resetCustomers(pgdb)
}

run().then(() => process.exit(0))
