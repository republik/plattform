const run = require('../run.js')

const dir = 'packages/backend-modules/call-to-actions/migrations/sqls'
const file = '20230309160825-setup'

exports.up = (db) => run(db, dir, `${file}-up.sql`)

exports.down = (db) => run(db, dir, `${file}-down.sql`)
