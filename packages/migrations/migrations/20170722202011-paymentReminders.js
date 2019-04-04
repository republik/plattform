const run = require('../run.js')

const dir = 'servers/republik/migrations/crowdfunding/sqls'
const file = '20170722202011-paymentReminders'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
