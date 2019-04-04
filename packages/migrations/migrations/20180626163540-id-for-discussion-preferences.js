const run = require('../run.js')

const dir = 'packages/discussions/migrations/sqls'
const file = '20180626163540-id-for-discussion-preferences'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
