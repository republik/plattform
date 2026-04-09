const run = require('../run.js')

const dir = 'packages/backend-modules/referral-campaigns/migrations/sqls'
const file = '20260309162534-status-created-at-idx'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
