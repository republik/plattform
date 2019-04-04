const run = require('../run.js')

const dir = 'servers/republik/migrations/sqls'
const file = '20190206164619-cancellations-refactor'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
