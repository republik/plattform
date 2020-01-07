const run = require('../run.js')

const dir = 'packages/maillog/migrations/sqls'
const file = '20200102013701-index-email-attribute'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
