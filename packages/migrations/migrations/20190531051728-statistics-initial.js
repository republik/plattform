const run = require('../run.js')

const dir = 'packages/statistics/migrations/sqls'
const file = '20190531051728-statistics-initial'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
