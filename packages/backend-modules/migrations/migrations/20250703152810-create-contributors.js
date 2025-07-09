const run = require('../run.js')

const dir = 'packages/backend-modules/contributors/migrations'
const file = '20250703152810-create-contributors'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
