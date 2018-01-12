/**
 * This script generates stripe customers for existing stripe sources
 *
 * Usage:
 * node script/launch/createStripeCustomers.js [--test]
 */
require('../../lib/env')
const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')
const createCustomer = require('../../modules/crowdfundings/lib/payments/stripe/createCustomer')

const testMode = process.argv[2] === '--test'

console.log(`running createStripeCustomers.js${testMode ? ' (in TEST mode)' : ''}...`)
PgDb.connect().then(async pgdb => {
  const sources = await pgdb.query(`
    SELECT
      p.*,
      to_json(u.*) AS user
    FROM
      "paymentSources" p
    JOIN
      users u
      ON p."userId"=u.id
    WHERE
      p.method = 'STRIPE'
      ${testMode
        ? "AND u.email ilike '%@republik.ch'"
        : ''
      }
  `)

  let skippedUserEmails = []
  let doneUserEmails = []
  let errorUserEmails = []
  // stop after one error, work done till then is saved
  for (let source of sources) {
    const transaction = await pgdb.transactionBegin()
    try {
      if (await transaction.public.stripeCustomers.findFirst({ userId: source.user.id })) {
        skippedUserEmails.push(source.user.email)
      } else {
        await createCustomer({
          sourceId: source.pspId,
          userId: source.user.id,
          pgdb: transaction
        })
        await transaction.public.paymentSources.deleteOne({ id: source.id })
        doneUserEmails.push(source.user.email)
        console.log(source.user.email + ' success!')
      }
      await transaction.transactionCommit()
    } catch (e) {
      await transaction.transactionRollback()
      errorUserEmails.push(source.user.email)
      console.error('--------------------------------\ntransaction rollback', {
        error: e.message,
        source: {
          id: source.id,
          pspId: source.pspId,
          user: {
            id: source.user.id,
            email: source.user.email
          }
        }
      })
    }
  }

  console.log('\nResults:')
  console.log(`the following users (${skippedUserEmails.length}) already have a stripe customer and were skipped:`, skippedUserEmails.length
    ? skippedUserEmails.join(', ')
    : 'none'
  )
  console.log(`error for (${errorUserEmails.length}) emails:`, skippedUserEmails.length
    ? errorUserEmails.join(', ')
    : 'none'
  )
  console.log(`success for (${doneUserEmails.length}) emails:`, skippedUserEmails.length
    ? doneUserEmails.join(', ')
    : 'none'
  )
  console.log('stripeCustomers total:',
    await pgdb.queryOneField('SELECT count(distinct("userId")) as count from "stripeCustomers"')
  )
  console.log(`createStripeCustomers finished!`)
}).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
