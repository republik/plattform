const run = require('../run.js')

const dir = 'packages/voting/migrations/sqls'
const file = '20181011100656-election-ballots'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
