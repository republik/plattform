const run = require('../run.js')

const dir = 'packages/backend-modules/migrations/sqls/contributors'
const file = '20260911120000-drop-contributors'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

// no rollback: the contributors tables were never used
exports.down = () => Promise.resolve()
