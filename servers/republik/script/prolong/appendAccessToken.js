#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const { csvFormat, csvParse } = require('d3-dsv')
const { transformUser, AccessToken } = require('@orbiting/backend-modules-auth')
const fs = require('fs').promises
const path = require('path')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const Promise = require('bluebird')
const yargs = require('yargs')

const argv = yargs
  .option('file', {
    description: 'CSV file to append token to',
    alias: 'f',
    required: true,
    coerce: input => path.resolve(input)
  })
  .option('identifier', {
    description: 'attribute name which points to a user ID',
    alias: 'i',
    default: 'userId'
  })
  .option('scope', {
    description: 'Access Token scope',
    alias: 's',
    default: 'CUSTOM_PLEDGE'
  })
  .argv

PgDb.connect().then(async pgdb => {
  const listRaw = await fs.readFile(argv.file, 'utf-8')

  const listArray = csvParse(listRaw)

  const users = await pgdb.public.users.find({ id: listArray.map(row => row[argv.identifier]) })
    .then(users => users.map(transformUser))

  const list = await Promise.map(listArray, async (row, index) => {
    const user = users.find(user => user.id === row[argv.identifier])

    if (!user) {
      throw new Error(`User with ID "${row[argv.identifier]}" not found.`)
    }

    const token = await AccessToken.generateForUser(user, argv.scope)

    return {
      ...row,
      CP_ATOKEN: token
    }
  }, { concurrency: 1 })

  console.log(csvFormat(list.filter(Boolean)))

  await pgdb.close()
})
