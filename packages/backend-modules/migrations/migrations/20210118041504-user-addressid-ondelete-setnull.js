const run = require('../run.js')

const dir = 'packages/republik/migrations/crowdfunding/sqls'
const file = '20210118041504-user-addressid-ondelete-setnull'

exports.up = (db) => run(db, dir, `${file}-up.sql`)

exports.down = (db) => run(db, dir, `${file}-down.sql`)
