/**
 * This script generates stripe customers for existing stripe sources
 *
 * Usage:
 * node script/launch/createStripeCustomers.js [--test]
 */
require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const createCustomer = require('../../modules/crowdfundings/lib/payments/stripe/createCustomer')
const addSource = require('../../modules/crowdfundings/lib/payments/stripe/addSource')
const removeCustomer = require('./removeStripeCustomer')

const testMode = process.argv[2] === '--test'

console.log(`running createStripeCustomers.js${testMode ? ' (in TEST mode)' : ''}...`)
PgDb.connect().then(async pgdb => {
  let users = await pgdb.query(`
    SELECT
      u.*,
      to_json(array_agg(p.*)) AS sources
    FROM
      users u
    JOIN
      "paymentSources" p
      ON p."userId"=u.id
    WHERE
      p.method = 'STRIPE'
      ${testMode
    ? ''// "AND u.email ilike '%@republik.ch'"
    : ''
}
    GROUP BY 1
  `)

  if (testMode) {
    users = users.slice(-1)
  }

  let doneUserEmails = []
  let errorUserEmails = []
  let investigateUserEmails = []

  for (let user of users) {
    console.log(user.email, user.id)
    const transaction = await pgdb.transactionBegin()
    try {
      let customerCreated = false
      if (!(await transaction.public.stripeCustomers.findFirst({ userId: user.id }))) {
        console.log('\tcreating stripe customer...')
        await createCustomer({
          // sourceId: source.pspId,
          userId: user.id,
          pgdb: transaction
        })
        customerCreated = true
      }
      let successForCustomer = false
      for (let source of user.sources) {
        try {
          console.log('\tadding source ' + source.pspId + '...')
          await addSource({
            sourceId: source.pspId,
            userId: user.id,
            pgdb: transaction,
            deduplicate: true
          })
          successForCustomer = true
          console.log('\tdeleting source from db...')
          await transaction.public.paymentSources.deleteOne({ id: source.id })
        } catch (e2) {
          console.log('\tfailed to add source (moving to PAYMENTSLIP):', e2.message, source.pspId)
          await transaction.public.paymentSources.updateOne(
            { id: source.id },
            { method: 'PAYMENTSLIP' }
          )
        }
      }
      if (successForCustomer) {
        console.log('\tsuccess!')
        doneUserEmails.push(user.email)
      } else if (customerCreated) {
        console.log('\tremoving customer again')
        errorUserEmails.push(user.email)
        await removeCustomer({
          userId: user.id,
          pgdb: transaction
        })
      } else {
        console.log('\tINVESTIGATE', user.id, user.email)
        investigateUserEmails.push(user.email)
      }
      await transaction.transactionCommit()
    } catch (e) {
      await transaction.transactionRollback()
      errorUserEmails.push(user.email)
      console.error('--------------------------------\ntransaction rollback', {
        error: e.message,
        user
      })
    }
  }

  console.log('\nResults:')
  console.log(`error for (${errorUserEmails.length}) emails:`, errorUserEmails.length
    ? errorUserEmails.join(', ')
    : 'none'
  )
  console.log(`success for (${doneUserEmails.length}) emails:`, doneUserEmails.length
    ? doneUserEmails.join(', ')
    : 'none'
  )
  console.log(`investigate (${investigateUserEmails.length}) emails:`, investigateUserEmails.length
    ? investigateUserEmails.join(', ')
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
