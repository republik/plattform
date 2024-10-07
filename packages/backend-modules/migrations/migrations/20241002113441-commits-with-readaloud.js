const run = require('../run.js')

const dir = 'packages/backend-modules/publikator/migrations/sqls'
const file = '20241002113441-commits-with-readaloud'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
