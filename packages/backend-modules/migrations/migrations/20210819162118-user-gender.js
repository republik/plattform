const run = require('../run.js')

const dir = 'packages/republik/migrations/sqls'
const file = '20210819162118-user-gender'

exports.up = (db) => run(db, dir, `${file}-up.sql`)

exports.down = (db) => run(db, dir, `${file}-down.sql`)
