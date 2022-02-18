const run = require('../run.js')

const dir = 'packages/embeds/migrations/sqls'
const file = '20211014100106-remove-url-caseinsensitivity'

exports.up = (db) => run(db, dir, `${file}-up.sql`)

exports.down = (db) => run(db, dir, `${file}-down.sql`)
