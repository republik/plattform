const run = require('../run.js')

const dir = 'packages/backend-modules/gift-articles/migrations/sqls'
const file = '20260617120000-gift-articles'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
