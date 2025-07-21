const run = require('../run.js')

const dir = 'packages/backend-modules/subscriptions/migrations/sqls'
const file = '20250721163424-delete-cascade-notifications'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
