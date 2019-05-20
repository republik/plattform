const run = require('../run.js')

const dir = 'packages/auth/migrations/sqls'
const file = '20181121163231-access-token'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
