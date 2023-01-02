const run = require('../run.js')

const dir = 'packages/backend-modules/calendar/migrations/sqls'
const file = '20221002112223-init'

exports.up = (db) => run(db, dir, `${file}-up.sql`)

exports.down = (db) => run(db, dir, `${file}-down.sql`)
