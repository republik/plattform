const run = require('../run.js')

const dir = 'packages/collections/migrations/sqls'
const file = '20181219155946-init-collections'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
