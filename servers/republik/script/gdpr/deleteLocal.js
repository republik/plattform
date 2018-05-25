/**
 * This script deletes users from postgresql
 *
 * Usage:
 * node script/deleteLocal.js
 */
require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')

console.log('running deleteLocal.js...')
PgDb.connect().then(async pgdb => {
  const dryRun = process.argv[2] === '--dry'
  if (dryRun) {
    console.log("dry run: this won't change anything in the DB")
  }

  const transaction = await pgdb.transactionBegin()
  try {
    console.log(`#users: ${await transaction.public.users.count()}`)

    // this is only correct as long as PRIVACY is not REVOKEable
    const deleteUserIds = await transaction.queryOneColumn(`
      SELECT
        DISTINCT(u.id) AS id
      FROM
        users u
      WHERE
        u.id NOT IN (
          -- have privacy consent
          -- this is only correct as long as PRIVACY is not REVOKEable
          SELECT DISTINCT(c."userId") AS id
          FROM consents c
          WHERE c.policy = 'PRIVACY' AND c.record = 'GRANT'
        ) AND
        u.id NOT IN (
          -- have stripe customer
          SELECT DISTINCT(sc."userId") AS id
          FROM "stripeCustomers" sc
        ) AND
        u.email NOT LIKE '%project-r.construction' AND
        u.email NOT LIKE '%republik.ch'
    `)
    console.log(`#userIds to delete: ${deleteUserIds.length}`)

    const options = { deleteUserIds }

    // didn't find a way to get the num deleted back with query
    await transaction.query(`
      DELETE
        FROM sessions s
      WHERE
        ARRAY[(s.sess #>> '{passport, user}')::uuid] && :deleteUserIds
    `, options)
    console.log('deleted sessions')

    const numDeleteEventLog = await transaction.public.eventLog.delete({
      userId: deleteUserIds
    })
    console.log(`#numDeleteEventLog: ${numDeleteEventLog}`)

    const numDeleteCredentials = await transaction.public.credentials.delete({
      userId: deleteUserIds
    })
    console.log(`#numDeleteCredentials: ${numDeleteCredentials}`)

    const numDeleteUsers = await transaction.public.users.delete({
      id: deleteUserIds
    })
    console.log(`#numDeleteUsers: ${numDeleteUsers}`)

    console.log(`#users: ${await transaction.public.users.count()}`)

    if (dryRun) {
      console.log('rolling back transaction (dryMode)...')
      await transaction.transactionRollback()
    } else {
      console.log('commiting transaction...')
      await transaction.transactionCommit()
    }
  } catch (e) {
    console.log('rolling back transaction...')
    console.log(e)
    await transaction.transactionRollback()
    throw e
  }

  console.log(`#users (after transaction): ${await pgdb.public.users.count()}`)
}).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
