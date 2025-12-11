const run = require('../run.js')

const dir = 'packages/backend-modules/republik/migrations/sqls'
const file = '20250910161858-calculate-kpis-view'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
