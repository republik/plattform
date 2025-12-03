const run = require('../run.js')

const dir = 'packages/backend-modules/republik/migrations/sqls'
const file = '20251203160843-add-onboarded'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
