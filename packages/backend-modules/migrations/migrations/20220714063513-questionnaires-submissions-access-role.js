const run = require('../run.js')

const dir = 'packages/backend-modules/voting/migrations/sqls'
const file = '20220714063513-questionnaires-submissions-access-role'

exports.up = (db) => run(db, dir, `${file}-up.sql`)

exports.down = (db) => run(db, dir, `${file}-down.sql`)
