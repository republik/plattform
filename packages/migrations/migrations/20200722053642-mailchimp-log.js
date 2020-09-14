const run = require('../run.js')

const dir = 'packages/mail/migrations/sqls'
const file = '20200722053642-mailchimp-log'

exports.up = (db) => run(db, dir, `${file}-up.sql`)

exports.down = (db) => run(db, dir, `${file}-down.sql`)
