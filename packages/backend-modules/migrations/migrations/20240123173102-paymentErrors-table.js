const run = require('../run.js')

const dir = '/packages/backend-modules/datatrans/migrations/sqls'
const file = '20240123173102-paymentErrors-table'

exports.up = (db) => run(db, dir, `${file}-up.sql`)

exports.down = (db) => run(db, dir, `${file}-down.sql`)
