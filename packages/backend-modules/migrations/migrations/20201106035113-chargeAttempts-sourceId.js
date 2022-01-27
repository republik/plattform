const run = require('../run.js')

const dir = 'packages/republik/migrations/sqls/'
const file = '20201106035113-chargeAttempts-sourceId'

exports.up = (db) => run(db, dir, `${file}-up.sql`)

exports.down = (db) => run(db, dir, `${file}-down.sql`)
