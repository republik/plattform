const run = require('../run.js')

const dir = 'servers/republik/migrations/sqls'
const file = '20200107024934-cancellation-uncertain-future'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
