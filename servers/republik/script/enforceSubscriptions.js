#!/usr/bin/env node
/**
 * Enforces MailChimp subscriptions. Accepts a list of emails and/or ids.
 * @example ./enforceSubscriptions.js --emails foobar@domain.tld x@y.z
 */
require('@orbiting/backend-modules-env').config()
const { enforceSubscriptions } = require('../modules/crowdfundings/lib/Mail')
const debug = require('debug')('republik:script:enforceSubscriptions')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const Promise = require('bluebird')
const yargs = require('yargs')

const argv = yargs
  .option('emails', {
    alias: ['email', 'e'],
    array: true,
    default: undefined
  })
  .option('ids', {
    alias: ['id'],
    array: true,
    default: undefined
  })
  .option('dry', {
    alias: 'd',
    boolean: true,
    default: true
  })
  .help()
  .version()
  .argv

const run = async () => {
  const pgdb = await PgDb.connect()

  const stats = { users: 0 }

  const statsInterval = setInterval(() => {
    console.log({ stats })
  }, 1000 * 5).unref()

  try {
    const query = {
      or: [{ email: argv.emails }, { id: argv.ids }]
    }

    debug('%s', JSON.stringify(query))

    const users = await pgdb.public.users.find(query, { skipUndefined: true })

    if (argv.dry) {
      console.log('dry run', { users: users.length })
    } else {
      await Promise.map(
        users,
        user => enforceSubscriptions({ pgdb, userId: user.id })
          .then(() => { stats.users++ }),
        { concurrency: 10 }
      )
    }
  } catch (e) {
    console.error('enforceSubscriptions failed', argv, e)
  } finally {
    clearInterval(statsInterval)
    console.log({ stats })
    console.log('Done.')
  }
}

run().then(() => process.exit(0))
