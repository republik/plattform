const run = require('../run.js')

const dir = 'servers/republik/migrations/sqls'
const file = '20200617122258-submit-pledge-payload'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
