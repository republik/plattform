const run = require('../run.js')

const dir = 'packages/backend-modules/payments/migrations/sql'
const file = '20240717170243-payments-tables'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
