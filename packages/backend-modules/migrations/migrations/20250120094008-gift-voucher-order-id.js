const run = require('../run.js')

const dir = 'packages/backend-modules/payments/migrations/sql'
const file = '20250120094008-gift-voucher-order-id'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
