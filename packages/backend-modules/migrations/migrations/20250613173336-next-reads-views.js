const run = require('../run.js')

const dir = 'packages/backend-modules/next-reads/migrations/sqls'
const file = '20250613173336-next-reads-views'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
