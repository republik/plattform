const run = require('../run.js')

const dir = 'packages/backend-modules/cms/migrations/sqls'
const file = '20230804102803-entity'

exports.up = (db) => run(db, dir, `${file}-up.sql`)

exports.down = (db) => run(db, dir, `${file}-down.sql`)
