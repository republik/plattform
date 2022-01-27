const run = require('../run.js')

const dir = 'packages/discussions/migrations/sqls'
const file = '20211112155132-discussion-defaultOrder'

exports.up = (db) => run(db, dir, `${file}-up.sql`)

exports.down = (db) => run(db, dir, `${file}-down.sql`)
