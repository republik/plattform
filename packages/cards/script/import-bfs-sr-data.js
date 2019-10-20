#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const fetch = require('node-fetch')
const Promise = require('bluebird')
const url = require('url')
const yargs = require('yargs')
const crypto = require('crypto')

const argv = yargs
  .option('data-url', { alias: 'd', required: true, coerce: url.parse })
  .option('mapping-url', { alias: 'm', required: true, coerce: url.parse })
  .option('mock', { alias: 't', default: false })
  .option('force', { alias: 'f', default: false })
  .option('slack-channel', { alias: 'c', default: 'C8NH13Q1W' }) // #comments-dev
  .argv

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const Redis = require('@orbiting/backend-modules-base/lib/Redis')
const { publish } = require('@orbiting/backend-modules-slack')

const districtMap = {
  'Aargau': 'Aargau',
  'Appenzell Ausserrhoden': 'Appenzell Ausserrhoden',
  'Appenzell Innerrhoden': 'Appenzell Innerrhoden',
  'Basel-Landschaft': 'Basel-Landschaft',
  'Basel-Stadt': 'Basel-Stadt',
  'Bern / Berne': 'Bern',
  'Fribourg / Freiburg': 'Freiburg',
  'Genève': 'Genf',
  'Glarus': 'Glarus',
  'Graubünden / Grigioni / Grischun': 'Graubünden',
  'Jura': 'Jura',
  'Luzern': 'Luzern',
  'Neuchâtel': 'Neuenburg',
  'Nidwalden': 'Nidwalden',
  'Obwalden': 'Obwalden',
  'Schaffhausen': 'Schaffhausen',
  'Schwyz': 'Schwyz',
  'Solothurn': 'Solothurn',
  'St. Gallen': 'St. Gallen',
  'Thurgau': 'Thurgau',
  'Ticino': 'Tessin',
  'Uri': 'Uri',
  'Valais / Wallis': 'Wallis',
  'Vaud': 'Waadt',
  'Zug': 'Zug',
  'Zürich': 'Zürich'
}

const sanitize = (string) => {
  return string
    .replace(/[ä]/g, 'ae')
    .replace(/[ö]/g, 'oe')
    .replace(/[ü]/g, 'ue')
    .replace(/[áàâä]/g, 'a')
    .replace(/[éèê]/g, 'e')
    .replace(/[íìî]/g, 'i')
    .replace(/[óòôö]/g, 'o')
    .replace(/[úùûü]/g, 'u')
    .replace(/[^A-Za-z]/g, '')
    .slice(0, 4)
    .toLowerCase()
    .trim()
}

const maybeTrue = (probability) => Math.random() < probability

Promise.props({ pgdb: PgDb.connect(), redis: Redis.connect() }).then(async (connections) => {
  const { pgdb, redis } = connections

  if (argv.mock) {
    console.warn('WARNING: Data mocking enabled, remove --mock flag.')
  }

  const dataRaw = await fetch(argv['data-url'])
    .then(res => {
      if (!res.ok) {
        throw Error(`Unable to fetch data-url "${url.format(argv['data-url'])}" (HTTP Status Code: ${res.status})`)
      }

      return res.text()
    })

  console.log('Data fetched.')

  const { timestamp, kandidierende } = JSON.parse(dataRaw.trim())

  console.log(`Data timestamp: ${timestamp}`)

  const currentHash = crypto.createHash('md5').update(JSON.stringify(kandidierende)).digest('hex')

  const redisKey = 'cards:script:import-bfs-sr-data:hash-kandidierende'
  const previousHash = await redis.getAsync(redisKey)

  if (previousHash === currentHash && !argv.mock && !argv.force) {
    console.log(`Data hash same (${previousHash}), skipping update. Force update with "--force true".`)
    return connections
  }

  console.log(`Data hash different to before: ${currentHash}. Updating.`)
  await redis.setAsync(redisKey, currentHash)

  /**
    {
      "bfsHash": "f33b6be8b8bca11bb04c1fa1097b7157",
      "cardId": "243dbc51-014f-4e7b-827d-401781ad7671"
    },
   */
  const bfsMapping = await fetch(argv['mapping-url'])
    .then(res => {
      if (!res.ok) {
        throw Error(`Unable to fetch data-url "${url.format(argv['data-url'])}" (HTTP Status Code: ${res.status})`)
      }

      return res.json()
    })

  console.log('Mapping fetched.')

  const cardGroups = await pgdb.public.cardGroups.findAll()
  const cards = (await pgdb.public.cards.findAll())
    .map(r => {
      r.group = cardGroups.find(cardGroup => cardGroup.id === r.cardGroupId)

      return r
    })

  const stats = { mismatched: 0, tooMany: 0, none: 0 }
  const mock = { elects: 46, probability: 1 / kandidierende.length * 30 }

  await Promise.each(
    kandidierende,
    async (k, index) => {
      const bfsHash =
      crypto.createHash('md5').update(`${k.kanton_nummer}-${k.vorname}-${k.name}`).digest('hex')

      if (k._matched) {
        throw new Error(`matchend twice, bfsHash "${bfsHash}"`)
      }

      /**
       * Kandidierende SR INT 2
        {
          "kanton_nummer":26,
          "kanton_bezeichnung":"Jura",
          "zweiter_wahlgang_noetig":null,
          "name":"Crevoisier Crelier",
          "vorname":"Mathilde",
          "geschlecht":"F",
          "geburtsdatum":null,
          "kandidat_partei_id":3,
          "flag_gewaehlt":false,
          "stimmen_kandidat":null
        }
      */

      const { cardId } = bfsMapping.find(b => b.bfsHash === bfsHash) || {}
      const mappedCards = cards.filter(c => c.id === cardId)
      const bfsHashCards = cards.filter(c => c.payload.meta.bfsHash === bfsHash)

      const matchedCards = cards
        .filter(c => c.group.name === districtMap[k.kanton_bezeichnung])
        .filter(c => {
          const cFirstName = sanitize(c.payload.meta.firstName)
          const cLastName = sanitize(c.payload.meta.lastName)

          const kFirstName = sanitize(k.vorname)
          const kLastName = sanitize(k.name)

          const cName = `${cFirstName} ${cLastName}`
          const cNameInvert = `${cLastName} ${cFirstName}`
          const kName = `${kFirstName} ${kLastName}`

          return cName === kName || cNameInvert === kName
        })

      const card =
        (mappedCards.length === 1 && mappedCards[0]) ||
        (bfsHashCards.length === 1 && bfsHashCards[0]) ||
        (matchedCards.length === 1 && matchedCards[0])

      kandidierende[index]._bfsHash = bfsHash

      if (!card) {
        stats.mismatched++

        kandidierende[index]._matched = false

        console.log([ k._bfsHash, districtMap[k.kanton_bezeichnung], k.vorname, k.name ].join('\t'))

        if (matchedCards.length > 1) stats.tooMany++
        if (matchedCards.length === 0) stats.none++
      } else {
        const { id, payload } = card

        kandidierende[index]._matched = true
        kandidierende[index]._cardId = id

        let secondBallotNecessary = !!k.zweiter_wahlgang_noetig
        let elected = !!k.flag_gewaehlt
        let votes = +k.stimmen_kandidat

        if (argv.mock) {
          secondBallotNecessary = false
          elected = false
          votes = Math.round(Math.random() * 2500000)

          if (mock.elects > 0 && maybeTrue(mock.probability)) {
            elected = true
            mock.elects--
          } else if (maybeTrue(mock.probability)) {
            secondBallotNecessary = true
          }
        }

        const updatedPayload = {
          ...payload,
          meta: {
            ...payload.meta,
            bfsHash
          },
          councilOfStates: {
            ...payload.councilOfStates,
            secondBallotNecessary,
            elected,
            votes
          }
        }

        await pgdb.public.cards.updateOne(
          { id },
          { payload: updatedPayload }
        )
      }
    })

  console.log('Done.', { stats, matched: kandidierende.filter(k => k._matched).length })

  if (argv.slackChannel && !argv.mock) {
    const dataStats = await pgdb.queryOne(`
      SELECT
        COUNT(*)
          FILTER (WHERE (payload->'councilOfStates'->>'elected')::bool = TRUE) "countCouncilOfStatesMembers",
        COUNT(DISTINCT name)
          FILTER (WHERE (payload->'councilOfStates'->>'elected')::bool = TRUE) "countCouncilOfStatesCantons",
        json_agg(DISTINCT name)
          FILTER (WHERE
            (payload->'councilOfStates'->>'elected')::bool = TRUE
            AND (payload->'councilOfStates'->>'votes')::integer >= 0
          ) "listCouncilOfStatesCantons"

        FROM cards
        JOIN "cardGroups" ON cards."cardGroupId" = "cardGroups".id
      ;
    `)

    const content = [
      `:ballot_box_with_ballot: *Update Ständerat* (Daten vom Bundesamt für Statistik)`,
      '',
      `${dataStats.countCouncilOfStatesMembers} gewählte Mitglieder für den Ständerat`,
      dataStats.listCouncilOfStatesCantons && `Kantone: ${dataStats.listCouncilOfStatesCantons.join(', ')}`
    ].filter(Boolean).join('\n')

    const currentHash = crypto.createHash('md5').update(content).digest('hex')

    const redisKey = 'cards:script:import-bfs-sr-data:hash-slack'
    const previousHash = await redis.getAsync(redisKey)

    if (previousHash !== currentHash) {
      console.log(`Slack hash different to before: ${currentHash}. Posting.`)
      await publish(argv.slackChannel, content)
    } else {
      console.log(`Slack hash same (${previousHash}), skipping posting.`)
    }

    await redis.setAsync(redisKey, currentHash)
  }

  return connections
})
  .then(async ({ pgdb, redis }) => {
    await PgDb.disconnect(pgdb)
    await Redis.disconnect(redis)
  })
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
