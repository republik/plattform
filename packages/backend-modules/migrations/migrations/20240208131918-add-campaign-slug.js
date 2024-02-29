const run = require('../run.js')

const dir = 'packages/backend-modules/referral-campaigns/migrations/sqls'
const file = '20240208131918-add-campaign-slug'

exports.up = (db) => run(db, dir, `${file}-up.sql`)

exports.down = (db) => run(db, dir, `${file}-down.sql`)
