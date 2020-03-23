#!/usr/bin/env node

// subscribe mailchimp export to newsletters
//
// usage: ./packages/subscriptions/script/subscribeMC.js https://republik-assets.s3.eu-central-1.amazonaws.com/tmp/testtest.csv
//
// csv example:
// E-Mail-Adresse,"Republik NL"
// patrick.recher@republik.ch,"Täglich, Wochenende"

require('@orbiting/backend-modules-env').config()
const Promise = require('bluebird')
const fetch = require('isomorphic-unfetch')
const { csvParse } = require('d3-dsv')
const { t } = require('@orbiting/backend-modules-translate')

const loaderBuilders = {
  ...require('@orbiting/backend-modules-documents/loaders'),
  ...require('@orbiting/backend-modules-subscriptions/loaders')
}

const {
  Subscriptions: {
    upsertSubscription
  }
} = require('@orbiting/backend-modules-subscriptions')
const {
  lib: { ConnectionContext }
} = require('@orbiting/backend-modules-base')

const downloadUrl = process.argv[2]
if (!downloadUrl) {
  throw new Error('missing url to mailchimp export as first param')
}

Promise.resolve().then(async () => {
  const loaders = {}
  const context = {
    ...await ConnectionContext.create('script'),
    loaders,
    t
  }
  Object.keys(loaderBuilders).forEach(key => {
    loaders[key] = loaderBuilders[key](context)
  })

  const { pgdb } = context

  const listRaw = await fetch(downloadUrl)
    .then(res => res && res.status === 200 && res.text())

  if (!listRaw || !listRaw.length) {
    throw new Error('downloaded file invalid!', listRaw)
  }

  const importedList = csvParse(listRaw)

  const emails = importedList
    .map(line => ({
      email: line['E-Mail-Adresse'],
      newsletters: {
        daily: line['Republik NL'].indexOf('Täglich') > -1,
        weekly: line['Republik NL'].indexOf('Wochenende') > -1
      }
    }))

  const users = await pgdb.public.users.find({
    'roles ?': 'member',
    email: emails.map(e => e.email)
  })
    .then(us => us.map(u => ({
      ...emails.find(s => s.email.toLowerCase() === u.email.toLowerCase()),
      id: u.id,
      email: u.email
    })))

  const transaction = await pgdb.transactionBegin()
  try {
    await Promise.map(
      users,
      (user) =>
        Promise.all([
          user.newsletters.daily && upsertSubscription(
            {
              userId: user.id,
              type: 'Document',
              objectId: 'republik/format-newsletter-um-7'
              // objectId: 'republik-dev/format-newsletter-um-7'
            },
            context
          ),
          user.newsletters.weekly && upsertSubscription(
            {
              userId: user.id,
              type: 'Document',
              objectId: 'republik/format-wochenende-newsletter'
              // objectId: 'republik-dev/format-wochenende-newsletter'
            },
            context
          )
        ])
    )

    await transaction.transactionCommit()
  } catch (e) {
    await transaction.transactionRollback()
    console.error('rollback!', e)
    throw new Error(t('api/unexpected'))
  }

  console.log({
    emails: emails.length,
    users: users.length
  })

  return context
})
  .then(async (context) => {
    await ConnectionContext.close(context)
  }).catch(e => {
    console.error(e)
    process.exit(1)
  })
