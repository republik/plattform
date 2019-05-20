const run = require('../run.js')

const dir = 'servers/republik/migrations/sqls'
const file = '20190109074657-paymentslip-bank-accounts'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
