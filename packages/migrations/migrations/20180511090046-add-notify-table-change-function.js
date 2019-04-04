const run = require('../run.js')

const dir = 'servers/republik/migrations/sqls'
const file = '20180511090046-add-notify-table-change-function'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
