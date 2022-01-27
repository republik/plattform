const run = require('../run.js')

const dir = 'packages/publikator/migrations/sqls'
const file = '20210921061755-drop-git-hashes'

exports.up = (db) => run(db, dir, `${file}-up.sql`)

exports.down = (db) => run(db, dir, `${file}-down.sql`)
