const run = require('../run.js')

const dir = 'packages/backend-modules/migrations/sqls/publikator'
const file = '20220212005725-derivatives'

exports.up = (db) => run(db, dir, `${file}-up.sql`)

exports.down = (db) => run(db, dir, `${file}-down.sql`)
