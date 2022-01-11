const run = require('../run.js')

const dir = 'packages/subscriptions/migrations/sqls'
const file = '20220111155837-drop-unused-indices'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
