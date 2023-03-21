const run = require('../run.js')

const dir = 'packages/backend-modules/republik/migrations/sqls'
const file = '20230316094520-drop-cash-payments'

exports.up = (db) => run(db, dir, `${file}-up.sql`)

exports.down = (db) => run(db, dir, `${file}-down.sql`)
