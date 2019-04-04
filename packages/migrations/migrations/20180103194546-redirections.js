const run = require('../run.js')

const dir = 'packages/redirections/migrations/sqls'
const file = '20180103194546-redirections'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
