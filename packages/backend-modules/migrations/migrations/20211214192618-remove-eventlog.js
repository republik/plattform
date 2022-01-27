const run = require('../run.js')

const dir = 'packages/auth/migrations/sqls'
const file = '20211214192618-remove-eventlog'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
