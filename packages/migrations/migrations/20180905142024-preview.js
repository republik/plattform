const run = require('../run.js')

const dir = 'packages/preview/migrations/sqls'
const file = '20180905142024-preview'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
