const run = require('../run.js')

const dir = '/packages/backend-modules/republik-crowdfundings/migrations/sqls'
const file = '20240126153918-add-autopay-mutable-field'

exports.up = (db) => run(db, dir, `${file}-up.sql`)

exports.down = (db) => run(db, dir, `${file}-down.sql`)
