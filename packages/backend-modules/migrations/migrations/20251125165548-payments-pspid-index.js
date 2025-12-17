const run = require('../run.js')

const dir = 'packages/backend-modules/republik/migrations/crowdfunding/sqls'
const file = '20251125165548-payments-pspid-index'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
