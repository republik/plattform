const run = require('../run.js')

const dir = 'packages/discussions/migrations/sqls'
const file = '20190128140850-nullify-comment-userId'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
