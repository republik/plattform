#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const path = require('path')
const recursive = require('recursive-readdir')
const Promise = require('bluebird')
const yargs = require('yargs')
const { promises: fs } = require('fs')

const argv = yargs
  .option('path', {
    alias: 'p',
    required: true,
    coerce: input => path.resolve('./', input)
  })
  .argv

const { lib: { Portrait } } = require('@orbiting/backend-modules-assets')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')

PgDb.connect().then(async pgdb => {
  console.log('Loading file list...')
  const files = await recursive(path.join(argv.path, '/elected'), ['.*'])

  await Promise.each(
    files.filter(file => !file.match(/(Icon\r$)/g)),
    async file => {
      console.log(file)
      const portrait = await fs.readFile(file)
      const ids = file.match(/(\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b)/g, '$1')

      if (!ids) {
        console.warn('\tNot IDs recognized in name.')
        return
      }

      const card = await pgdb.public.cards.findOne({ id: ids[0] })

      if (!card) {
        console.warn('\tCard not found.')
        return
      }

      const user = await pgdb.public.users.findOne({ id: card.userId })

      if (user.portraitUrl) {
        console.warn('\tUser has portrait already.')
        return
      }

      try {
        console.log('\tUploading...')
        const portraitUrl = await Portrait.upload(portrait)
        console.log(`\tportraitUrl: ${portraitUrl}`)
        await pgdb.public.users.update({ id: user.id }, { portraitUrl, updatedAt: new Date() })
      } catch (e) {
        console.warn(e)
      }
    }
  )

  console.log('Done.')

  await PgDb.disconnect(pgdb)
}).catch(console.error)
