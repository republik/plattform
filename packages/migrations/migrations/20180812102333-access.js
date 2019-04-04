const run = require('../run.js')

const dir = 'packages/access/migrations/sqls'
const file = '20180812102333-access'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
