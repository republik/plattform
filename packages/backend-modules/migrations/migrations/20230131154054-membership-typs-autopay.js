const run = require('../run.js')

const dir = 'packages/backend-modules/republik-crowdfundings/migrations/sqls'
const file = '20230131154054-membership-typs-autopay'

exports.up = (db) => run(db, dir, `${file}-up.sql`)

exports.down = (db) => run(db, dir, `${file}-down.sql`)
