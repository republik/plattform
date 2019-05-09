const run = require('../run.js')

const dir = 'packages/auth/migrations/sqls'
const file = '20180516113512-consents'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
