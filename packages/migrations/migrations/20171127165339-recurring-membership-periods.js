const run = require('../run.js')

const dir = 'servers/republik/migrations/sqls'
const file = '20171127165339-recurring-membership-periods'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
