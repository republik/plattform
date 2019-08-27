#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const assert = require('assert')
const { dsvFormat } = require('d3-dsv')
const Promise = require('bluebird')
const rw = require('rw')

const { slug } = require('@project-r/styleguide/lib/lib/slug')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')

const sampleDataLobbywatch = require('../data/sample-lobbywatch.json')

const parse = dsvFormat(';').parse

const probableTrue = (probability) => Math.random() < probability

const maybeNumber = (value) => {
  const number = Number(value.replace(/,/g, '.'))
  return number || (value || null)
}

const sanitizeMetaDistrict = (value) => {
  if (value === 'St.Gallen') {
    return 'St. Gallen'
  }

  return value
}

const extractSocialHandle = (url) => {
  const match = url.match(/(?:facebook|twitter)\.com\/([^/]+)/)

  if (match) {
    return match[1]
  }

  return false
}

const assignElection = (payload) => {
  if (payload.meta.electionId === '223') {
    return {
      councilOfStates: Object.assign({}, payload.councilOfStates, {
        candidacy: true,
        incumbent: payload.meta.incumbent,
        elected: payload.meta.elected
      })
    }
  }

  if (payload.meta.electionId === '222') {
    return {
      nationalCouncil: Object.assign({}, payload.nationalCouncil, {
        candidacy: true,
        incumbent: payload.meta.incumbent,
        elected: payload.meta.elected
      })
    }
  }

  return {}
}

const toPayload = (row) => {
  const payload = {
    yearOfBirth: maybeNumber(row.year_of_birth),
    occupation: row.occupation,
    listName: row.list || null,
    listNumbers: [row.candidate_no_1, row.candidate_no_2].filter(Boolean) || null,
    listPlaces: [row.list_place_1, row.list_place_2].filter(Boolean) || null,
    party: row.party_short || null,
    smartvoteCleavage:
      row.cleavage_1
        ? [1, 2, 3, 4, 5, 6, 7, 8].map((index) => maybeNumber(row[`cleavage_${index}`]))
        : null,
    vestedInterestsSmartvote:
      [1, 2, 3, 4, 5, 6, 7, 8].map((index) => {
        if (!row[`interest_name_${index}`]) {
          return
        }

        return {
          name: row[`interest_name_${index}`] || null,
          position: row[`interest_position_${index}`] || null,
          entity: row[`interest_legal_form_${index}`] || null
        }
      }).filter(Boolean) || null,
    vestedInterestsLobbywatch:
      probableTrue(0.2)
        ? sampleDataLobbywatch
        : null,
    campaignBudget: row.campaign_budget || null,
    campaignBudgetComment: row.cb_comment || null,
    nationalCouncil: {
      candidacy: false,
      incumbent: false,
      elected: false,
      electionPlausability: 0 // @TODO: Evaluate Wahlwahrschenlichkeit
    },
    councilOfStates: {
      candidacy: false,
      incumbent: false,
      elected: false,
      electionPlausability: 0 // @TODO: Evaluate Wahlwahrschenlichkeit
    },
    meta: {
      userId: row.ID_user || null,
      candidateId: row.ID_Candidate || null,
      firstName: row.firstname || null,
      lastName: row.lastname || null,
      email: row['e-mail_public'] || null,
      facebookId: extractSocialHandle(row['LINK_facebook']) || null,
      twitterHandle: extractSocialHandle(row['LINK_twitter']) || null,
      publicUrl: row['LINK_personal_website'] || null,
      district: sanitizeMetaDistrict(row.district) || null,
      electionId: row.ID_election || null,
      incumbent: row.incumbent !== '0',
      elected: row.elected !== '0'
    }
  }

  Object.assign(payload, assignElection(payload))

  return payload
}

PgDb.connect().then(async pgdb => {
  const input = rw.readFileSync('/dev/stdin', 'utf8')
  const raw = parse(input) // .slice(120, 122)
  const payloads = raw.map(toPayload)

  /**
   * Upsert CardGroups
   */
  const districts = new Set(payloads.map(p => p.meta.district))
  const groups = await pgdb.public.cardGroups.findAll()

  await Promise.each(districts, async district => {
    console.log(`CardGroup "${district}" needed...`)

    if (!groups.find(({ name }) => district === name)) {
      console.log(`CardGroup "${district}" missing, creating...`)
      const group = await pgdb.public.cardGroups.insertAndGet({
        name: district,
        slug: slug(district)
      })

      // @TODO: Upsert Group Discussion
      groups.push(group)
    }
  })

  /**
   * Upsert Card
   */
  const cards = await pgdb.public.cards.findAll()

  const userEmails = payloads.map(payload => payload.meta.email).filter(Boolean)
  const tempEmails = payloads.map(payload => `card-wahl2019-${payload.meta.identifier}@republik.ch`)
  const users = await pgdb.public.users.find({
    email: userEmails.concat(tempEmails)
  })

  const now = new Date()

  await Promise.each(payloads, async payload => {
    const identifier = payload.meta.userId
    const district = payload.meta.district

    const name = [payload.meta.firstName, payload.meta.lastName].join(' ')

    console.log(`Card "${name}" (ID: "${identifier}")`)

    const card = cards.find(card => card.payload.meta.userId === identifier)

    if (!card) {
      console.log('  is missing, creating...')
      const group = groups.find(({ name }) => district === name)

      const tempEmail = `card-wahl2019-${identifier}@republik.ch`

      const user =
        users.find(({ email }) => email === payload.meta.email || email === tempEmail) ||
        await pgdb.public.users.insertAndGet({
          email: tempEmail,
          firstName: payload.meta.firstName,
          lastName: payload.meta.lastName,
          facebookId: payload.meta.facebookId,
          twitterHandle: payload.meta.twitterHandle,
          publicUrl: payload.meta.publicUrl,
          username: `card-wahl2019-${identifier}`,
          verified: false,
          hasPublicProfile: true,
          isListed: true
        })

      const insertedCard = await pgdb.public.cards.insertAndGet({
        payload,
        cardGroupId: group.id,
        userId: user.id
      })

      cards.push(insertedCard)
    } else {
      const updatedPayload = Object.assign({}, card.payload, assignElection(payload))

      console.log('  exists')

      try {
        assert.deepStrictEqual(updatedPayload, card.payload)
      } catch (e) {
        console.log('  requires an update')

        await pgdb.public.cards.update(
          { id: card.id },
          {
            payload: updatedPayload,
            updatedAt: now
          }
        )
      }
    }
  })

  console.log('Import Overview', {
    groups: groups.length,
    cards: cards.length
  })

  console.log('Done.')

  await pgdb.close()
})
