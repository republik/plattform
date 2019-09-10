const run = require('../run.js')

const dir = 'packages/access/migrations/sqls'
const file = '20190909040718-mail-config'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
