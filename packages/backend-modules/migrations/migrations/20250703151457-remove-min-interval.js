const run = require('../run.js')

const dir = 'packages/backend-modules/discussions/migrations/sqls'
const file = '20250703151457-remove-min-interval'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
