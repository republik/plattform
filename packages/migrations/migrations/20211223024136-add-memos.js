const run = require('../run.js')

const dir = 'packages/publikator/migrations/sqls'
const file = '20211223024136-add-memos'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
