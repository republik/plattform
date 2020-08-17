#!/usr/bin/env node
/**
 * This script updates cancellations from a csv
 * columns: done adminUrl membershipCancellationId cancelledAt reason newCategory suppressWinback cancelledViaSupport
 *
 * Usage:
 * cat local/cancellations.csv | node script/prolong/updateCancellations.js
 */
require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const rw = require('rw')
const {dsvFormat} = require('d3-dsv')
const csvParse = dsvFormat(',').parse
const Promise = require('bluebird')

console.log('running updateCancellations.js...')

const getNormalizedCategory = (category) => {
  switch (category) {
    case 'EDITORIAL_MIX':
      return 'EDITORIAL'
    case 'NARCISSISTIC':
      return 'EDITORAL_NARCISSISTIC'
    case 'PAPER_NO_ONLINE':
      return 'PAPER'
    case 'EXPECTIONS_DIFFERENT':
      return 'EXPECTIONS'
    case 'TOOMUCHTO_READ':
      return 'TOO_MUCH_TO_READ'
    default:
      return category
  }
}

PgDb.connect().then(async pgdb => {
  const dry = process.argv[2] === '--dry'
  if (dry) {
    console.log("dry run: this won't change anything")
  }

  const input = rw.readFileSync('/dev/stdin', 'utf8')
  if (!input || input.length < 4) {
    throw new Error('You need to provide input on stdin')
  }

  const stats = {
    cancellations: 0
  }

  const transaction = await pgdb.transactionBegin()
  await Promise.map(
    csvParse(input)
      .filter(r => !r.done),
    ({ membershipCancellationId, newCategory, suppressWinback, cancelledViaSupport }) => {
      stats.cancellations++

      const normalizedCategory = getNormalizedCategory(newCategory)

      return transaction.public.membershipCancellations.update(
        { id: membershipCancellationId },
        {
          category: normalizedCategory,
          suppressWinback: suppressWinback === 'TRUE',
          cancelledViaSupport: !!cancelledViaSupport
        }
      )
    },
    {concurrency: 10}
  )

  console.log(stats)

  if (dry) {
    console.log('rollback due to dry')
    await transaction.transactionRollback()
  } else {
    await transaction.transactionCommit()
  }
}).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
