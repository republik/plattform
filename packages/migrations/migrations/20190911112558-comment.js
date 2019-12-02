const run = require('../run.js')

const dir = 'packages/cards/migrations/sqls'
const file = '20190911112558-comment'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
