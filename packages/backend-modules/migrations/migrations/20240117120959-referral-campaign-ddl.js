const run = require('../run.js')

const dir = './packages/backend-modules/referral-campaigns/migrations/sqls'
const file = '20240117120959-referral-campaign-ddl'

exports.up = (db) => run(db, dir, `${file}-up.sql`)

exports.down = (db) => run(db, dir, `${file}-down.sql`)
