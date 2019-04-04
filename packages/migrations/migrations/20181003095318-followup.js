const run = require('../run.js')

const dir = 'packages/preview/migrations/sqls'
const file = '20181003095318-followup'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
