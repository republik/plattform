const run = require('../run.js')

const dir = 'servers/republik/migrations/sqls'
const file = '20190115181908-changeover-ref-memberships'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
