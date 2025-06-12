require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const rw = require('rw')
const { dsvFormat } = require('d3-dsv')
const csvParse = dsvFormat(',').parse
const bluebird = require('bluebird')

console.log('running import of first name statistics of BfS....')

PgDb.connect()
  .then(async (pgdb) => {
    const dry = process.argv[2] === '--dry'
    if (dry) {
      console.log("dry run: this won't change anything")
    }

    const input = rw.readFileSync('/dev/stdin', 'utf8')
    if (!input) {
      throw new Error('You need to provide input on stdin')
    }

    const transaction = await pgdb.transactionBegin()

    try {
      console.log('Truncate db table statisticsNameSex...')
      await transaction.public.statisticsNameSex.truncate()

      console.log('Parse csv and insert into db table...')
      const rows = csvParse(input)
      await bluebird.each(rows, (row) => {
        let femaleCount = parseInt(row.female, 10)
        let maleCount = parseInt(row.male, 10)
        let sex = 'both'
        if (isNaN(femaleCount) || femaleCount === 0) {
          femaleCount = null
          sex = 'male'
        } else if (isNaN(maleCount) || maleCount === 0) {
          maleCount = null
          sex = 'female'
        }

        return transaction.public.statisticsNameSex.insert({
          firstName: row.firstname,
          femaleCount,
          maleCount,
          sex,
        })
      })
    } catch (e) {
      console.log('Error while importing data: ', e)
      await transaction.transactionRollback()
      throw e;
    }

    if (dry) {
      console.log('rolling back...')
      await transaction.transactionRollback()
    } else {
      console.log('comitting changes...')
      await transaction.transactionCommit()
    }
  })
  .then(() => {
    process.exit()
  })
  .catch((e) => {
    console.log(e)
    process.exit(1)
  })
