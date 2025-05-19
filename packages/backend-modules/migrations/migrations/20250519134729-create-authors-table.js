const run = require('../run.js')

const dir = 'packages/backend-modules/authors/migrations/sqls'
const file = '20250519134729-create-authors-table'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
