const run = require('../run.js')

const dir = 'packages/backend-modules/collections/migrations/sqls/'
const file = '20250616113324-add-collection-items-created-at-index'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
