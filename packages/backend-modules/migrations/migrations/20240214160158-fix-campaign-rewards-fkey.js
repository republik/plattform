const run = require('../run.js')

const dir = '/packages/backend-modules/referral-campaigns/migrations/sqls'
const file = '20240214160158-fix-campaign-rewards-fkey'

exports.up = (db) => run(db, dir, `${file}-up.sql`)

exports.down = (db) => run(db, dir, `${file}-down.sql`)
