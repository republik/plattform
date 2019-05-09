const { PgDb } = require('pogi')
const {timeParse} = require('d3-time-format')

const parser = timeParse('%Y-%m-%d %H %Z')

const connect = () =>
  PgDb.connect({ connectionString: process.env.DATABASE_URL })
    .then(async (pgdb) => {
      // custom date parser
      // parse db dates as 12:00 Zulu
      // this applies to dates only (not datetime)
      const dateParser = val => {
        const date = parser(val + ' 12 Z')
        return date
      }
      await pgdb.setTypeParser('date', dateParser)

      return pgdb
    })

const disconnect = pgdb =>
  pgdb.close()

module.exports = {
  connect,
  disconnect
}
