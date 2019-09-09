const run = require('../run.js')

const dir = 'packages/cards/migrations/sqls'
const file = '20190827090733-setup'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
