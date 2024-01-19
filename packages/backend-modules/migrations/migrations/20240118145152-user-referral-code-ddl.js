const run = require('../run.js')

const dir = './packages/backend-modules/auth/migrations/sqls'
const file = '20240118145152-user-referral-code-ddl'

exports.up = (db) => run(db, dir, `${file}-up.sql`)

exports.down = (db) => run(db, dir, `${file}-down.sql`)
