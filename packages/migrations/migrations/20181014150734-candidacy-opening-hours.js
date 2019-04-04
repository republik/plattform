const run = require('../run.js')

const dir = 'packages/voting/migrations/sqls'
const file = '20181014150734-candidacy-opening-hours'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
