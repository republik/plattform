const run = require('../run.js')

const dir = 'packages/backend-modules/discussions/migrations/sqls'
const file = '20251126094211-discussion-preference-lookup-idx'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
