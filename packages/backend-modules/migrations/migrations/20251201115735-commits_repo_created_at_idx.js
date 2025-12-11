const run = require('../run.js')

const dir = 'packages/backend-modules/publikator/migrations/sqls'
const file = '20251201115735-commits_repo_created_at_idx'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
