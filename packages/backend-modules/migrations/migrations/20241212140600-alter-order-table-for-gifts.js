const run = require('../run.js')

const dir = 'packages/backend-modules/payments/migrations/sql'
const file = '20241212140600-alter-order-table-for-gifts'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
