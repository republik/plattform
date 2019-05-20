const run = require('../run.js')

const dir = 'packages/voting/migrations/sqls'
const file = '20181022140254-questionnaires'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
