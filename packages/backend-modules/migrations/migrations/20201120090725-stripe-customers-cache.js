const run = require('../run.js')

const dir = 'packages/republik/migrations/sqls'
const file = '20201120090725-stripe-customers-cache'

exports.up = (db) => run(db, dir, `${file}-up.sql`)

exports.down = (db) => run(db, dir, `${file}-down.sql`)
