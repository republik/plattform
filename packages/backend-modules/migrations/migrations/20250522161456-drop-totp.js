const run = require('../run.js')

const dir = 'packages/backend-modules/auth/migrations/sqls'
const file = '20250522161456-drop-totp'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
