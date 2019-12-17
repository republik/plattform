#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const { dsvFormat } = require('d3-dsv')
const assert = require('assert')
const fetch = require('node-fetch')
const Promise = require('bluebird')
const yargs = require('yargs')

const argv = yargs
  .option('sr-data-url', { alias: 's', required: true, coerce: s => new URL(s) })
  .option('nr-data-url', { alias: 'n', required: true, coerce: s => new URL(s) })
  .argv

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')

const handleResponse = async res => {
  if (!res.ok) {
    throw Error(`Unable to fetch url "${res.url}" (HTTP Status Code: ${res.status})`)
  }

  return dsvFormat(',').parse(await res.text()).map(row => ({ ...row, elected: !!(row.elected && row.elected === 'Y') }))
}

PgDb.connect().then(async pgdb => {
  const { sr, nr } = await Promise.props({
    sr: fetch(argv['sr-data-url']).then(handleResponse),
    nr: fetch(argv['nr-data-url']).then(handleResponse)
  })

  console.log('Import Overview', {
    sr: sr.length,
    nr: nr.length
  })

  const cards = await pgdb.public.cards.findAll() /* (
    { id: sr.map(r => r.ID).concat(nr.map(r => r.ID)) }
  ) */

  console.log(cards.length)

  const now = new Date()

  await Promise.each(cards, async card => {
    const srRecord = sr.find(r => r.ID === card.id)
    const nrRecord = nr.find(r => r.ID === card.id)

    // clone
    const updatedPayload = {
      ...card.payload,
      councilOfStates: {
        ...card.payload.councilOfStates,
        secondBallotNecessary: false
      },
      nationalCouncil: {
        ...card.payload.nationalCouncil,
        elected: false
      }
    }

    if (srRecord) {
      const { votes, elected } = srRecord

      Object.assign(updatedPayload, {
        ...updatedPayload,
        councilOfStates: {
          ...updatedPayload.councilOfStates,
          votes: parseInt(votes),
          elected
        }
      })
    }

    if (nrRecord) {
      Object.assign(updatedPayload, {
        ...updatedPayload,
        nationalCouncil: {
          ...updatedPayload.nationalCouncil,
          elected: true
        }
      })
    }

    try {
      assert.deepStrictEqual(updatedPayload, card.payload)
    } catch (e) {
      console.log(card.payload.meta.firstName, card.payload.meta.lastName)

      await pgdb.public.cards.update(
        { id: card.id },
        {
          payload: updatedPayload,
          updatedAt: now
        }
      )
    }
  })

  console.log('Done.')

  await pgdb.close()
}).catch(e => {
  console.error(e)
  process.exit(1)
})
