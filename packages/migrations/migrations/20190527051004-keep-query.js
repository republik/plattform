const run = require('../run.js')

const dir = 'packages/redirections/migrations/sqls'
const file = '20190527051004-keep-query'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
