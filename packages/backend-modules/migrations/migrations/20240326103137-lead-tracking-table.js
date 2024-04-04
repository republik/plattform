const run = require('../run.js')

const dir = 'packages/backend-modules/lead-tracking/migrations/sql'
const file = '20240326103137-lead-tracking-table'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
