const run = require('../run.js')

const dir = 'packages/backend-modules/allowlist/migrations/sqls'
const file = '20250105000000-ip-allowlist'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)

