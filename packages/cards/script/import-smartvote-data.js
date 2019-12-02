#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const { dsvFormat } = require('d3-dsv')
const assert = require('assert')
const fetch = require('node-fetch')
const Promise = require('bluebird')
const url = require('url')
const yargs = require('yargs')
const fs = require('fs').promises
const path = require('path')

const argv = yargs
  .option('data-url', { alias: 'd', required: true, coerce: url.parse })
  .option('lobbywatch-url', { alias: 'l', required: true, coerce: url.parse })
  .option('elected-url', { alias: 'e', required: true, coerce: url.parse })
  .argv

const { slug } = require('@project-r/styleguide/lib/lib/slug')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')

const maybeString = (value) => {
  if (!value) {
    return null
  }

  const string = String(value).trim()

  return string
}

const maybeNumber = (value) => {
  if (!value) {
    return null
  }

  const number = Number(String(value).replace(/,/g, '.'))

  if (number === 0) {
    return 0
  }

  return number || (value || null)
}

const maybeSocialHandle = (url) => {
  if (!url) {
    return null
  }

  const match = String(url).match(/(?:facebook|twitter)\.com\/([^/]+)/)

  if (!match) {
    return null
  }

  return match[1]
}

const maybeLinkSmartvote = (electionId, url) => {
  if (!electionId || !url) {
    return null
  }

  // from http://www.smartvote.ch/19_ch_nr/portrait/candidate/index/44200001337?lang=de_CH
  const match = String(url).match(/(\d{11})/)

  // to https://www.smartvote.ch/de/group/2/election/19_ch_nr/db/candidates/44200001337
  if (!match) {
    return null
  }

  if (electionId === '222') {
    return `https://www.smartvote.ch/de/group/2/election/19_ch_nr/db/candidates/${match[1]}`
  }

  if (electionId === '223') {
    return `https://www.smartvote.ch/de/group/2/election/19_ch_sr/db/candidates/${match[1]}`
  }

  return null
}

const sanitizeMetaDistrict = (value) => {
  if (value === 'St.Gallen') {
    return 'St. Gallen'
  }

  return value
}

const fractionMap = {
  'JBDP': 'BDP',
  'CSP': 'CVP',
  'CSPO': 'CVP',
  'CSV': 'CVP',
  'JCSPO': 'CVP',
  'JCVP': 'CVP',
  'überp. CVP': 'CVP',
  'jevp': 'EVP',
  'jf': 'FDP',
  'jLDP': 'FDP',
  'LDP': 'FDP',
  'jglp': 'GLP',
  'BastA!': 'GPS',
  'Grüne': 'GPS',
  'JG': 'GPS',
  'JGBNW': 'GPS',
  'JSP': 'SP',
  'JUSO': 'SP',
  'JSVP': 'SVP',
  'BDP': 'BDP',
  'CVP': 'CVP',
  'EVP': 'EVP',
  'FDP': 'FDP',
  'glp': 'GLP',
  'SP': 'SP',
  'SVP': 'SVP',
  'Thomas, Minder, Parteilos': 'SVP'
}

const maybeFraction = (row) => {
  return (
    fractionMap[maybeString(row.party_short)] ||
    fractionMap[[row.firstname, row.lastname, row.party_short].join(', ')] ||
    null
  )
}

const partyParentMap = {
  'JBDP': 'BDP',
  'CSP': 'CVP',
  'CSPO': 'CVP',
  'CSV': 'CVP',
  'JCSPO': 'CVP',
  'JCVP': 'CVP',
  'überp. CVP': 'CVP',
  'jevp': 'EVP',
  'jf': 'FDP',
  'jLDP': 'FDP',
  'LDP': 'FDP',
  'jglp': 'GLP',
  'BastA!': 'GPS',
  'Grüne': 'GPS',
  'JG': 'GPS',
  'JGBNW': 'GPS',
  'JSP': 'SP',
  'JUSO': 'SP',
  'JSVP': 'SVP',
  'BDP': 'BDP',
  'CVP': 'CVP',
  'EVP': 'EVP',
  'FDP': 'FDP',
  'glp': 'GLP',
  'SP': 'SP',
  'SVP': 'SVP'
}

const maybeMapPartyParent = (value) => {
  return partyParentMap[value] || value
}

const LABEL_CANDIDACY_NATIONAL_COUNCIL = 'Nationalratskandidatur'
const LABEL_CANDIDACY_COUNCTIL_OF_STATES_COUNCIL = 'Ständeratskandidatur'
const LABEL_CANDIDACIES_BOTH = 'National- und Ständeratskandidatur'

const listMap = {}
let lobbywatchData = []
let electedData = []

const assignElection = (payload) => {
  if (payload._import.electionId === '222') {
    const listMandatesPreviously =
      (
        listMap[payload._import.district] &&
        listMap[payload._import.district][payload.party] &&
        listMap[payload._import.district][payload.party][payload._import.listName]
      ) || null

    const minListPlace =
      payload._import.listPlaces.length > 0 &&
      payload._import.listPlaces.reduce((p, c) => c < p ? c : p)

    let electionPlausibility = 'UNKNOWN'

    if (!['Luzern', 'Bern'].includes(payload._import.district)) {
      if (minListPlace && listMandatesPreviously > 0) {
        electionPlausibility = 'WEAK'

        if (minListPlace <= listMandatesPreviously * 2) {
          electionPlausibility = 'DECENT'
        }

        if (minListPlace <= listMandatesPreviously + 1) {
          electionPlausibility = 'GOOD'
        }
      } else if (minListPlace && listMandatesPreviously) {
        electionPlausibility = 'WEAK'
      }

      if (minListPlace === 1) {
        electionPlausibility = 'GOOD'
      }
    } else if (payload._import.incumbent) {
      electionPlausibility = 'GOOD'
    }

    const elected = electedData.find(d => {
      return (
        d.smartvoteUserId === +payload.meta.userId &&
        d.smartvoteElectionId === +payload._import.electionId
      )
    }) || false

    return {
      nationalCouncil: Object.assign({}, payload.nationalCouncil, {
        listName: payload._import.listName,
        listNumbers: payload._import.listNumbers,
        listPlaces: payload._import.listPlaces,
        minListPlace,
        listMandatesPreviously,
        electionPlausibility,
        candidacy: true,
        incumbent: payload._import.incumbent,
        elected: !!elected || !!payload._import.elected,
        linkSmartvote: maybeLinkSmartvote(
          payload._import.electionId,
          payload._import.linkSmartvote
        )
      }),
      _import: Object.assign({}, payload._import, {
        credentialDescription: LABEL_CANDIDACY_NATIONAL_COUNCIL
      })
    }
  }

  if (payload._import.electionId === '223') {
    const elected = electedData.find(d => {
      return (
        d.smartvoteUserId === +payload.meta.userId &&
        d.smartvoteElectionId === +payload._import.electionId
      )
    }) || false

    return {
      councilOfStates: Object.assign({}, payload.councilOfStates, {
        candidacy: true,
        incumbent: payload._import.incumbent,
        elected: elected || payload._import.elected,
        linkSmartvote: maybeLinkSmartvote(
          payload._import.electionId,
          payload._import.linkSmartvote
        )
      }),
      _import: Object.assign({}, payload._import, {
        credentialDescription: LABEL_CANDIDACY_COUNCTIL_OF_STATES_COUNCIL
      })
    }
  }

  return {}
}

const assignLobbywatch = (payload) => {
  const record = lobbywatchData.find(d => d.smartvoteUserId === +payload.meta.userId)

  if (record) {
    return {
      lobbywatch: {
        transparencyLevel: record.lobbywatchTransparencyLevel,
        link: (new URL(`https://lobbywatch.ch/de/daten/parlamentarier/${record.lobbywatchParliamentarianId}/${record.lobbywatchName}`)).toString()
      }
    }
  }

  return {
    lobbywatch: {
      transparencyLevel: 'UNKNOWN',
      link: null
    }
  }
}

const toPayload = (row) => {
  const payload = {
    // Some obsolete fields, to ensure their gone
    // partyGroup: undefined,
    // partyRoot: undefined,

    // Actual payload fields
    yearOfBirth: maybeNumber(row.year_of_birth),
    age: maybeNumber(row.age),
    occupation: maybeString(row.occupation),
    party: maybeString(row.party_short),
    fraction: maybeFraction(row),
    partyParent: maybeMapPartyParent(maybeString(row.party_short)),
    lobbywatch: {
      transparencyLevel: 'UNKNOWN',
      link: null
    },
    smartvoteCleavage:
      row.cleavage_1
        ? [1, 2, 3, 4, 5, 6, 7, 8].map((index) => maybeNumber(row[`cleavage_${index}`]))
        : null,
    vestedInterests:
      [1, 2, 3, 4, 5, 6, 7, 8].map((index) => {
        if (!maybeString(row[`interest_name_${index}`])) {
          return
        }

        return {
          name: maybeString(row[`interest_name_${index}`]),
          position: maybeString(row[`interest_position_${index}`]),
          entity: maybeString(row[`interest_legal_form_${index}`])
        }
      }).filter(Boolean) || null,
    vestedInterestsSmartvote:
      [1, 2, 3, 4, 5, 6, 7, 8].map((index) => {
        if (!maybeString(row[`interest_name_${index}`])) {
          return
        }

        return {
          name: maybeString(row[`interest_name_${index}`]),
          position: maybeString(row[`interest_position_${index}`]),
          entity: maybeString(row[`interest_legal_form_${index}`])
        }
      }).filter(Boolean) || null,
    vestedInterestsLobbywatch: null,
    campaignBudget: maybeNumber(row.campaign_budget),
    campaignBudgetComment: maybeString(row.cb_comment),
    campaignBudgetSmartvote: maybeNumber(row.campaign_budget),
    campaignBudgetCommentSmartvote: maybeString(row.cb_comment),
    nationalCouncil: {
      listName: null,
      listNumbers: [],
      listPlaces: [],
      minListPlace: null,
      listMandatesPreviously: null,
      electionPlausibility: null,
      candidacy: false,
      incumbent: false,
      elected: false,
      linkSmartvote: null
    },
    councilOfStates: {
      candidacy: false,
      incumbent: false,
      elected: false,
      linkSmartvote: null
    },
    meta: {
      userId: maybeString(row.ID_user),
      candidateId: maybeString(row.ID_Candidate),
      email: maybeString(row['e-mail_public']),
      firstName: maybeString(row.firstname),
      lastName: maybeString(row.lastname),
      facebookId: maybeSocialHandle(row['LINK_facebook']),
      twitterHandle: maybeSocialHandle(row['LINK_twitter']),
      publicUrl: maybeString(row['LINK_personal_website']),
      language: maybeString(row.language)
    },
    _import: {
      district: sanitizeMetaDistrict(row.district) || null,
      electionId: maybeString(row.ID_election),
      listName: maybeString(row.list),
      listNumbers: [maybeString(row.candidate_no_1), maybeString(row.candidate_no_2)].filter(Boolean) || null,
      listPlaces: [maybeNumber(row.list_place_1), maybeNumber(row.list_place_2)].filter(Boolean) || null,
      incumbent: row.incumbent !== '0',
      elected: row.elected !== '0',
      credentialDescription: null,
      suggestedUsernames: [
        slug(`${row.firstname.slice(0, 1)}${row.lastname.replace(/[^\w]/g, '')}`),
        slug(`${row.firstname.slice(0, 2)}${row.lastname.replace(/[^\w]/g, '')}`),
        slug(`${row.firstname.slice(0, 1)}${row.lastname}${row.year_of_birth.slice(2, 4)}`)
      ],
      linkSmartvote: maybeString(row['LINK_portrait'])
    }
  }

  Object.assign(payload, assignElection(payload))

  return payload
}

PgDb.connect().then(async pgdb => {
  const input = await fetch(argv['data-url'])
    .then(res => {
      if (!res.ok) {
        throw Error(`Unable to fetch data-url "${url.format(argv['data-url'])}" (HTTP Status Code: ${res.status})`)
      }

      return res.text()
    })

  const raw = dsvFormat(';').parse(input)
  const payloads = raw.map(toPayload)
    .filter(({ meta }) => meta.userId && meta.candidateId)

  const listMapInput = await fs.readFile(
    path.join(__dirname, '../data/list-map.tsv'),
    'utf-8'
  )

  dsvFormat('\t').parse(listMapInput).map(row => {
    const { district, party, listName, seats, splitSeats } = row
    if (!listMap[district]) {
      listMap[district] = {}
    }

    if (!listMap[district][party]) {
      listMap[district][party] = {}
    }

    listMap[district][party][listName] = Number(splitSeats || seats)
  })

  lobbywatchData = await fetch(argv['lobbywatch-url'])
    .then(res => {
      if (!res.ok) {
        throw Error(`Unable to fetch lobbywatch-url "${url.format(argv['lobbywatch-url'])}" (HTTP Status Code: ${res.status})`)
      }

      return res.json()
    })

  if (lobbywatchData.length < 1) {
    throw new Error('lobbywatch-url data lacks records')
  }

  electedData = await fetch(argv['elected-url'])
    .then(res => {
      if (!res.ok) {
        throw Error(`Unable to fetch elected-url "${url.format(argv['elected-url'])}" (HTTP Status Code: ${res.status})`)
      }

      return res.json()
    })

  if (electedData.length < 1) {
    throw new Error('elected-url data lacks records')
  }

  /**
   * Upsert CardGroups
   */
  const districts = new Set(payloads.map(p => p._import.district))
  const groups = await pgdb.public.cardGroups.findAll()

  await Promise.each(districts, async district => {
    console.log(`CardGroup "${district}" needed...`)

    if (!groups.find(({ name }) => district === name)) {
      console.log(`CardGroup "${district}" missing, creating...`)
      const group = await pgdb.public.cardGroups.insertAndGet({
        name: district,
        slug: slug(district)
      })

      groups.push(group)
    }
  })

  /**
   * Upsert Card
   */
  const cards = await pgdb.public.cards.findAll()

  const emails =
    payloads
      .map(payload => payload.meta.email)
      .filter(Boolean)
      .concat(payloads.map(payload => `wahl2019-${payload.meta.userId}@republik.ch`))

  const users =
    emails.length > 0
      ? await pgdb.public.users.find({ email: emails })
      : []

  const credentials =
    cards.length > 0
      ? await pgdb.public.credentials.find({ userId: cards.map(card => card.userId) })
      : []

  const usernamesTaken = (await pgdb.public.users.find({
    username: payloads.map(payload => payload._import.suggestedUsernames).flat()
  })).map(user => user.username)

  const now = new Date()

  await Promise.each(payloads, async payload => {
    const identifier = payload.meta.userId
    const district = payload._import.district

    const name = [payload.meta.firstName, payload.meta.lastName].join(' ')

    console.log(`Card "${name}" (ID: "${identifier}")`)

    const card = cards.find(card => card.payload.meta.userId === identifier) || {}

    if (!card.payload) {
      console.log('  is missing, creating...')
      const group = groups.find(({ name }) => district === name)

      const tempEmail = payload.meta.email || `wahl2019-${identifier}@republik.ch`

      const user =
        users.find(({ email }) => {
          return (payload.meta.email && email.toLowerCase() === payload.meta.email.toLowerCase()) ||
          email.toLowerCase() === tempEmail.toLowerCase()
        }) ||
        await pgdb.public.users.insertAndGet({
          email: tempEmail,
          firstName: payload.meta.firstName,
          lastName: payload.meta.lastName,
          facebookId: payload.meta.facebookId,
          twitterHandle: payload.meta.twitterHandle,
          publicUrl: payload.meta.publicUrl,
          username: payload._import.suggestedUsernames.find(suggestedUsername => !usernamesTaken.includes(suggestedUsername)),
          verified: false,
          hasPublicProfile: true
        })

      usernamesTaken.push(user.username)

      const { _import, ...insertablePayload } = payload

      const insertedCard = await pgdb.public.cards.insertAndGet({
        payload: insertablePayload,
        cardGroupId: group.id,
        userId: user.id
      })

      Object.assign(card, insertedCard)
      cards.push(insertedCard)
    } else {
      console.log('  exists')

      const { partyGroup, partyRoot, ...cardPayload } = card.payload

      const { _import, ...updatedPayload } = Object.assign(
        {},

        // Current Payload
        cardPayload,

        // .nationalCouncil, .councilOfStates props
        assignElection(payload),

        // .lobbywatch prop
        assignLobbywatch(payload),

        // .meta
        {
          meta: {
            userId: card.payload.meta.userId || payload.meta.userId,
            candidateId: card.payload.meta.candidateId || payload.meta.candidateId,
            email: card.payload.meta.email || payload.meta.email,
            firstName: card.payload.meta.firstName || payload.meta.firstName,
            lastName: card.payload.meta.lastName || payload.meta.lastName,
            facebookId: card.payload.meta.facebookId || payload.meta.facebookId,
            twitterHandle: card.payload.meta.twitterHandle || payload.meta.twitterHandle,
            publicUrl: card.payload.meta.publicUrl || payload.meta.publicUrl,
            language: card.payload.meta.language || payload.meta.language
          }
        },

        // Obsolete fields, to be removed at once.
        /* {
          partyGroup: undefined, // card.payload.partyGroup || payload.partyGroup,
          partyRoot: undefined, // card.payload.partyRoot || payload.partyRoot,
        }, */

        // potentially updated data via Smartvote
        {
          yearOfBirth: card.payload.yearOfBirth || payload.yearOfBirth,
          age: card.payload.age || payload.age,
          occupation: card.payload.occupation || payload.occupation,
          party: card.payload.party || payload.party,
          fraction: card.payload.fraction || payload.fraction,
          partyParent: card.payload.partyParent || payload.partyParent,
          smartvoteCleavage: card.payload.smartvoteCleavage || payload.smartvoteCleavage
        },

        /**
         * WARNING: This may overwrite User-mutated data.
         */
        {
          // Campaign Budget (mutable by User)
          campaignBudget: card.payload.campaignBudget || payload.campaignBudget,
          campaignBudgetComment: card.payload.campaignBudgetComment || payload.campaignBudgetComment,

          // Campaign Budget via SmartVote
          campaignBudgetSmartvote: card.payload.campaignBudgetSmartvote || payload.campaignBudgetSmartvote,
          campaignBudgetCommentSmartvote: card.payload.campaignBudgetCommentSmartvote || payload.campaignBudgetCommentSmartvote,

          // Vested Interests (mutable by User)
          vestedInterests: card.payload.vestedInterests.length === 0 ? payload.vestedInterests : card.payload.vestedInterests,

          // Vested Interests
          vestedInterestsSmartvote: card.payload.vestedInterestsSmartvote.length === 0 ? payload.vestedInterestsSmartvote : card.payload.vestedInterestsSmartvote
        }
      )

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

        Object.assign(card, { payload: updatedPayload })
      }
    }

    /**
     * Roles (credentials)
     */
    const existingCredential = credentials.find(credential => {
      return credential.userId === card.userId &&
      credential.description === payload._import.credentialDescription
    })

    if (!existingCredential) {
      const insertedCredential = await pgdb.public.credentials.insertAndGet({
        userId: card.userId,
        description: payload._import.credentialDescription,
        isListed: true,
        verified: true
      })

      await pgdb.public.credentials.update(
        {
          userId: card.userId,
          'id !=': insertedCredential.id
        },
        { isListed: false, updatedAt: now }
      )

      credentials.push(insertedCredential)
    }

    const userCardCredentials = credentials.filter(credential => {
      return credential.userId === card.userId &&
      [
        LABEL_CANDIDACY_NATIONAL_COUNCIL,
        LABEL_CANDIDACY_COUNCTIL_OF_STATES_COUNCIL,
        LABEL_CANDIDACIES_BOTH
      ].includes(credential.description)
    })

    if (userCardCredentials.length === 2) {
      const insertedCredential = await pgdb.public.credentials.insertAndGet({
        userId: card.userId,
        description: LABEL_CANDIDACIES_BOTH,
        isListed: true, // !credentials.find(credential => credential.userId === card.userId),
        verified: true
      })

      await pgdb.public.credentials.update(
        {
          userId: card.userId,
          'id !=': insertedCredential.id
        },
        { isListed: false, updatedAt: now }
      )
    }
  })

  console.log('Import Overview', {
    groups: groups.length,
    cards: cards.length
  })

  console.log('Done.')

  await pgdb.close()
}).catch(e => {
  console.error(e)
  process.exit(1)
})
