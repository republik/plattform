#!/usr/bin/env node
/**
 * This script creates the files for a new DB-migration
*/

const yargs = require('yargs')
const fs = require('fs')
const path = require('path')
const moment = require('moment')

const metaDirAbs = path.join(__dirname, '../migrations/')
const repoRootAbs = path.join(__dirname, '../../../')

const argv = yargs
  .option('dir', { alias: ['d', 'sqldir'] })
  .option('name', { alias: ['n'] })
  .usage('Usage: $0 --sqldir <folder to store sqls (rel repo root)> --name <name of migration>')
  .demandOption(['dir', 'name'])
  .help()
  .version()
  .argv

const template = ({ dir, file }) =>
`const run = require('../run.js')

const dir = '${dir}'
const file = '${file}'

exports.up = (db) =>
  run(db, dir, \`\$\{file\}-up.sql\`)

exports.down = (db) =>
  run(db, dir, \`\$\{file\}-down.sql\`)
`

const sqlDirAbs = path.join(repoRootAbs, argv.dir)
if (!fs.existsSync(sqlDirAbs)) {
  throw new Error('specified sqldir does not exists')
}

const dateString = moment().format('YYYYMMDDhhmmss')
const filenameBase = `${dateString}-${argv.name}`

const metaFileAbs = path.join(metaDirAbs, `${filenameBase}.js`)
const upFileAbs = path.join(sqlDirAbs, `${filenameBase}-up.sql`)
const downFileAbs = path.join(sqlDirAbs, `${filenameBase}-down.sql`)

// write meta file
fs.writeFileSync(
  metaFileAbs,
  template({
    dir: argv.dir,
    file: filenameBase
  })
)

// write sql files
fs.writeFileSync(
  upFileAbs,
  '-- migrate up here: CREATE TABLE...'
)
fs.writeFileSync(
  downFileAbs,
  '-- migrate down here: DROP TABLE...'
)

console.log(`files written:\n${[metaFileAbs, upFileAbs, downFileAbs].join('\n')}`)
