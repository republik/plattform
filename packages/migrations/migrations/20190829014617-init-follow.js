const run = require('../run.js')

const dir = 'packages/follow/migrations/sqls/'
const file = '20190829014617-init-follow'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
