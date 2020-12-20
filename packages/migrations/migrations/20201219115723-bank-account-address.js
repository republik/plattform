const run = require('../run.js')

const dir = 'packages/republik/migrations/sqls'
const file = '20201219115723-bank-account-address'

exports.up = (db) => run(db, dir, `${file}-up.sql`)

exports.down = (db) => run(db, dir, `${file}-down.sql`)
