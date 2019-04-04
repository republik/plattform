const run = require('../run.js')

const dir = 'packages/access/migrations/sqls'
const file = '20181210164010-improvements'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
