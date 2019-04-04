const run = require('../run.js')

const dir = 'packages/auth/migrations/sqls'
const file = '20180731114301-tokens-expire-action'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
