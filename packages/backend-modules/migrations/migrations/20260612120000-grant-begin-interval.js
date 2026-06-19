const run = require('../run.js')

const dir = 'packages/backend-modules/access/migrations/sqls'
const file = '20260612120000-grant-begin-interval'

exports.up = (db) => run(db, dir, `${file}-up.sql`)

exports.down = (db) => run(db, dir, `${file}-down.sql`)
