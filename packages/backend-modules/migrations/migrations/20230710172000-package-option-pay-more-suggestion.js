const run = require('../run.js')

const dir = 'packages/backend-modules/republik-crowdfundings/migrations/sqls'
const file = '20230710172000-package-option-fixed-price'

exports.up = (db) => run(db, dir, `${file}-up.sql`)

exports.down = (db) => run(db, dir, `${file}-down.sql`)
