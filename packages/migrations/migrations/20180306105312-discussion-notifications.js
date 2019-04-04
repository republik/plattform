const run = require('../run.js')

const dir = 'packages/notifications/migrations/sqls'
const file = '20180306105312-discussion-notifications'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
