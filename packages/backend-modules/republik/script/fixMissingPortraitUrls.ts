require('@orbiting/backend-modules-env').config()

import yargs from 'yargs'
import Promise from 'bluebird'
import fetch from 'node-fetch'
import _debug from 'debug'

import { ConnectionContext } from '@orbiting/backend-modules-types'

const {
  lib: { ConnectionContext },
} = require('@orbiting/backend-modules-base')

const debug = _debug('republik:script:fixMissingPortraitUrls')

interface User {
  id: number
  isListed: boolean
  portraitUrl?: string
}

const fetchHead = (url: string) =>
  fetch(url, { method: 'HEAD' })
    .then((res) => {
      if (!res.ok) {
        return false
      }

      return res.headers
    })
    .catch((e) => {
      debug(`failed to fetch head for ${url}: ${e.message}`)
    })

const argv: { 'dry-run': boolean } = yargs.option('dry-run', {
  description: 'Run script in dry-mode',
  required: true,
  default: true,
}).argv

const applicationName = 'backends republik script fixMissingPortraitUrls'

ConnectionContext.create(applicationName)
  .then(async (context: ConnectionContext) => {
    const { pgdb } = context

    const users = await pgdb.public.users.find({ 'portraitUrl !=': null })

    debug('users: %d', users.length)

    if (argv['dry-run']) {
      console.warn(
        'WARNING: In dry-run-mode, not updating portraitUrl. Disable with --no-dry-run',
      )
    }

    await Promise.map(
      users,
      async (user: User, index: number) => {
        if (index % 100 === 0) {
          console.log('checked %d of %d', users.length - index, users.length)
        }

        const { portraitUrl } = user

        if (!portraitUrl) {
          debug('missing portraitUrl: %o', { id: user.id })
          return
        }

        const headers = await fetchHead(portraitUrl)

        if (headers) {
          debug('fetchable portraitUrl: %o', { id: user.id, portraitUrl })
        } else {
          debug('not fetchable portraitUrl: %o', {
            id: user.id,
            isListed: user.isListed,
            portraitUrl,
          })
          console.log([user.id, user.isListed, user.portraitUrl].join('\t'))

          if (!argv['dry-run']) {
            debug('set portraitUrl to null: %O', { id: user.id })
            await pgdb.public.users.update(
              { id: user.id },
              { portraitUrl: null, isListed: false },
            )
          }
        }
      },
      { concurrency: 25 },
    ).catch((e) => {
      console.error(e.message)
    })

    console.log('Done.')

    return context
  })
  .then((context: ConnectionContext) => ConnectionContext.close(context))
