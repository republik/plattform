const run = require('../run.js')

const dir = 'packages/backend-modules/mailchimp/migrations/sqls'
const file = '20220413113433-mailchimp-log-index-email'

exports.up = (db) => run(db, dir, `${file}-up.sql`)

exports.down = (db) => run(db, dir, `${file}-down.sql`)
