const run = require('../run.js')

const dir = 'packages/discussions/migrations/sqls/'
const file = '20190530022452-fix-depth'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
