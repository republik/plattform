const run = require('../run.js')

const dir = 'packages/backend-modules/discussions/migrations/sqls'
const file = '20251216113632-remove-discussion-allowedRoles'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
