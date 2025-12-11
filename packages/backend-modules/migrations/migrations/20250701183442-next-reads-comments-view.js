const run = require('../run.js')

const dir = 'packages/backend-modules/next-reads/migrations/sqls'
const file = '20250701183442-next-reads-comments-view'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
