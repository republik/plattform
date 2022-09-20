const run = require('../run.js')

const dir = 'packages/backend-modules/collections/migrations/sqls'
const file = '20220825121455-audio-queue'

exports.up = (db) => run(db, dir, `${file}-up.sql`)

exports.down = (db) => run(db, dir, `${file}-down.sql`)
