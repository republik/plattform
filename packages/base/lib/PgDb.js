const { PgDb } = require('pogi')
const { timeParse } = require('d3-time-format')

PgDb.prototype.queryInBatches = require('./PgDb/queryInBatches')

const parser = timeParse('%Y-%m-%d %H %Z')

const connect = ({ applicationName = 'backends' } = {}) => {
  const { DATABASE_URL, DATABASE_MAX_CONNECTIONS = null } = process.env

  return PgDb.connect({
    application_name: applicationName,
    connectionString: DATABASE_URL,
    max: DATABASE_MAX_CONNECTIONS,
  }).then(async (pgdb) => {
    // custom date parser
    // parse db dates as 12:00 Zulu
    // this applies to dates only (not datetime)
    const dateParser = (val) => {
      const date = parser(val + ' 12 Z')
      return date
    }
    await pgdb.setTypeParser('date', dateParser)

    return pgdb
  })
}

const disconnect = (pgdb) => pgdb.close()

module.exports = {
  connect,
  disconnect,
}
