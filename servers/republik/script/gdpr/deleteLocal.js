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
    await pgdb.query('ALTER TABLE sessions DISABLE TRIGGER trigger_sessions')

    // this is only correct as long as PRIVACY is not REVOKEable
    const numDeletes = await pgdb.queryOneField(`
      WITH delete_user_ids AS (
        SELECT
          DISTINCT(u.id) AS id
        FROM
          users u
        WHERE
          u.id NOT IN (
            -- have privacy consent
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
      ), delete_sessions AS (
        DELETE
          FROM sessions s
        WHERE
          (s.sess #>> '{passport, user}')::uuid IN (SELECT id FROM delete_user_ids)
      ), delete_event_log AS (
        DELETE
          FROM "eventLog" e
        WHERE
          e."userId" IN (SELECT id FROM delete_user_ids)
      ), delete_credentials AS (
        DELETE
          FROM "credentials" c
        WHERE
          c."userId" IN (SELECT id FROM delete_user_ids)
      )
      DELETE
        FROM users u
      WHERE
        u.id IN (SELECT id FROM delete_user_ids)
    `)
    console.log(`#deletes: ${numDeletes}`)

    await pgdb.query('ALTER TABLE sessions ENABLE TRIGGER trigger_sessions')

    if (dryRun) {
      console.log('rolling back transaction (dryMode)...')
      await transaction.transactionRollback()
    } else {
      console.log('commiting transaction...')
      await transaction.transactionCommit()
    }
  } catch (e) {
    console.log(e)
    await transaction.transactionRollback()
    throw e
  }

  // just to be sure
  await pgdb.query('ALTER TABLE sessions ENABLE TRIGGER trigger_sessions')
}).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
