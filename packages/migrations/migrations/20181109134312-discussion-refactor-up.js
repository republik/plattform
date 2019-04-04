const run = require('../run.js')

const dir = 'packages/discussions/migrations/sqls'

exports.up = (db) =>
  run(db, dir, '20181109134312-discussion-refactor-up.sql')

exports.down = (db) =>
  run(db, dir, '20181109134312-discussion-refactor-down.sql')
