#!/usr/bin/env node
/**
 * This script migrates the old portraitUrl format
 *
 * Usage:
 * ./script/migratePortraitUrls.js [--dry]
 */
require('@orbiting/backend-modules-env').config()
const fetch = require('isomorphic-unfetch')
const Promise = require('bluebird')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const { lib: { Portrait } } = require('@orbiting/backend-modules-assets')

console.log('running migratePortraitUrls.js...')
PgDb.connect().then(async pgdb => {
  const dry = process.argv[2] === '--dry'

  const users = await pgdb.public.users.find({
    'portraitUrl like': '%384x384%'
  })
  console.log(`num users to migrate: ${users.length}`)
  let progress = 0

  await Promise.map(
    users,
    async (user) => {
      let { portraitUrl } = user
      portraitUrl = portraitUrl.replace('_384x384', '_original')
      // download from s3 directly to avoid recompression
      portraitUrl = portraitUrl.replace('https://assets.republik.ch/', 'https://republik-assets.s3.eu-central-1.amazonaws.com/')

      const portrait = await fetch(portraitUrl)
        .catch(error => {
          console.error('image fetch failed', { portraitUrl, error })
        })
        .then(result => result.buffer())

      if (!portrait) {
        return
      }

      const newPortraitUrl = await Portrait.upload(portrait, dry)
        .catch(error => {
          console.error('uploadPortrait failed', { portraitUrl, error })
        })

      if (!dry && newPortraitUrl) {
        await pgdb.public.users.updateOne(
          { id: user.id },
          { portraitUrl: newPortraitUrl }
        )
      }
      if (progress < 10) {
        console.log({ id: user.id, portraitUrl, newPortraitUrl })
      }
      if (progress % 10 === 0) {
        console.log({ progress })
      }
      progress++
    },
    { concurrency: 10 }
  )
}).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
