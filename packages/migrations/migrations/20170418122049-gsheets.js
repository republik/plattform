const run = require('../run.js')

const dir = 'packages/gsheets/migrations/sqls'
const file = '20170418122049-gsheets'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
