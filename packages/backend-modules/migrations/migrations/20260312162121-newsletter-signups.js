const run = require('../run.js')

const dir = 'packages/backend-modules/lead-tracking/migrations/sql'
const file = '20260312162121-newsletter-signups'

exports.up = (db) =>
  run(db, dir, `${file}-up.sql`)

exports.down = (db) =>
  run(db, dir, `${file}-down.sql`)
