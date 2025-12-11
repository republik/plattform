const run = require('../run.js')

const dir = 'packages/backend-modules/push-notifications/migrations/sqls'
const file = '20251125160302-rename-discussion-notifications'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
