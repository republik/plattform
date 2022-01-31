const run = require('../run.js')

const dir = 'packages/offer/migrations/sqls'
const file = '20220103122136-add-pkg-options-suggestions'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
