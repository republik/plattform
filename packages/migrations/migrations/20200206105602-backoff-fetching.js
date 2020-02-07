const run = require('../run.js')

const dir = 'packages/embeds/migrations/sqls'
const file = '20200206105602-backoff-fetching'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
