const run = require('../run.js')

const dir = 'servers/republik/migrations/sqls'
const file = '20170724202357-migrate-crowdfunding'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) => {
  throw new Error("can't undo migrate-crowdfunding!")
}
