const run = require('../run.js')

const dir = 'packages/auth/migrations/sqls'
const file = '20170227114808-add-users-and-roles'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
