const run = require('../run.js')

const dir = 'packages/backend-modules/subscriptions/migrations/sqls'
const file = '20230308073821-active-filters'

exports.up = (db) => run(db, dir, `${file}-up.sql`)

exports.down = (db) => run(db, dir, `${file}-down.sql`)
