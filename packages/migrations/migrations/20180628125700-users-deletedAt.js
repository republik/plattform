const run = require('../run.js')

const dir = 'servers/republik/migrations/sqls'
const file = '20180628125700-users-deletedAt'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
