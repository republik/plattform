const run = require('../run.js')

const dir = 'packages/backend-modules/publikator/migrations/sqls'
const file = '20251113103452-add-image-metadata-to-files'

exports.up = (db) => run(db, dir, `${file}-up.sql`)

exports.down = (db) => run(db, dir, `${file}-down.sql`)

