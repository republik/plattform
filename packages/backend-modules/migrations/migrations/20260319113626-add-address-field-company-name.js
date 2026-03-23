const run = require('../run.js')

const dir = 'packages/backend-modules/republik/migrations/sqls'
const file = '20260319113626-add-address-field-company-name'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
