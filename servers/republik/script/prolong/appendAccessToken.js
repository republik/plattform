#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const { csvFormat, /* csvParse, dsvFormat, tsvFormat, */ tsvParse } = require('d3-dsv')
const Promise = require('bluebird')
const fs = require('fs').promises
const path = require('path')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const { transformUser, AccessToken } = require('@orbiting/backend-modules-auth')

PgDb.connect().then(async pgdb => {
  const listRaw = await fs.readFile(
    path.join(__dirname, '../data/abgelaufene-abos.tsv'),
    // path.join(__dirname, '../data/incumbents-locale.csv'),
    'utf-8'
  )

  const listArray = tsvParse(listRaw)
  // const listArray = csvParse(listRaw)

  // console.log(listArray)

  const users = await pgdb.public.users.find({ id: listArray.map(row => row['User ID']) })
    .then(users => users.map(transformUser))

  /*
  const pledges = await pgdb.public.pledges.find({
    userId: listArray.map(row => row['User ID']),
    status: 'SUCCESSFUL',
    'createdAt >': new Date('2019-09-27')
  }, {
    orderBy: 'createdAt'
  })

  const memberships = await pgdb.public.memberships.find({
    userId: listArray.map(row => row['User ID']),
    active: true
  })

  const accessGrants = await pgdb.public.accessGrants.find({
    accessCampaignId: '5b3329d8-5537-467c-b3d2-4cd6a95ef315',
    recipientUserId: listArray.map(row => row['User ID'])
  })

  console.log(
    pledges.length,
    pledges.map(p => ([p.userId, p.createdAt, p.total / 100])),
    pledges.reduce((a, c) => a + c.total, 0) / 100
  )
  console.log(pledges.filter(p => p.total <= 2200).map(p => p.total))
  console.log(memberships.length)
  console.log(accessGrants.length)
  process.exit(0) */

  const list = await Promise.map(listArray, async (row, index) => {
    const user = users.find(user => user.id === row['User ID'])

    if (!user) {
      throw new Error(`User with ID "${row['User ID']}" not found.`)
    }

    const token = await AccessToken.generateForUser(user, 'CLAIM_CARD')

    return {
      ...row,
      // email: user._raw.email,
      // REPUBLIK_SIGNUP_LINK: `https://www.republik.ch/wahltindaer/setup?token=${token}`
      FINANCING_URL: `https://www.republik.ch/wahltindaer/setup?token=${token}&locale=${row['Locale']}`
    }
  }, { concurrency: 1 })

  console.log(csvFormat(list.filter(Boolean)))

  await pgdb.close()
})
