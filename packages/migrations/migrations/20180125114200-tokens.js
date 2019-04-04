const run = require('../run.js')

const dir = 'packages/auth/migrations/sqls'
const file = '20180125114200-tokens'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
