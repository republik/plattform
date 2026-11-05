const run = require('../run.js')

const dir = 'packages/backend-modules/migrations/sqls/publikator'
const file = '20210520082541-repoid-as-foreignkey'

exports.up = (db) => run(db, dir, `${file}-up.sql`)

exports.down = (db) => run(db, dir, `${file}-down.sql`)
