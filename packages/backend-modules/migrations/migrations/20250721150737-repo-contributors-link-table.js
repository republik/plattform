const run = require('../run.js')

const dir = 'packages/backend-modules/contributors/migrations/sqls'
const file = '20250721150737-repo-contributors-link-table'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
