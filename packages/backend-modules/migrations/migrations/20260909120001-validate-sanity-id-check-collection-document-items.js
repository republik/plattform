const run = require('../run.js')

const dir = 'packages/backend-modules/collections/migrations/sqls/'
const file = '20260909120001-validate-sanity-id-check-collection-document-items'

exports.up = (db) => run(db, dir, `${file}-up.sql`)

exports.down = (db) => run(db, dir, `${file}-down.sql`)
