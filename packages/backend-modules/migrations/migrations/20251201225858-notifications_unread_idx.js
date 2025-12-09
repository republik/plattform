const run = require('../run.js')

const dir = 'packages/backend-modules/subscriptions/migrations/sqls'
const file = '20251201225858-notifications_unread_idx'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
