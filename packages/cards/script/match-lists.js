#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

// const _ = require('lodash')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')

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

const enrichTokens = [
  // SVP
  { token: 'Schweizerische Volkspartei', concat: ['SVP'] },
  { token: 'SVP', concat: ['Schweizerische Volkspartei'] },

  // BDP
  { token: 'Bürgerlich-Demokratische Partei', concat: ['BDP'] },
  { token: 'BDP', concat: ['Bürgerlich-Demokratische Partei'] },

  // CVP
  { token: 'Christlichdemokratische Volkspartei', concat: ['CVP'] },
  { token: 'CVP', concat: ['Christlichdemokratische Volkspartei'] },

  // EVP
  { token: 'Evangelische Volkspartei', concat: ['EVP'] },
  { token: 'EVP', concat: ['Evangelische Volkspartei'] },

  // Andere
  { token: 'Wirtschaft', concat: ['Gewerbe'] },
  { token: 'Gewerbe', concat: ['Wirtschaft'] }
]

const normalizeDistrict = (string) => {
  return districtMap[string] || string
}

const toTokens = (string) => {
  const tokens = Array.from(new Set(
    string
      .toLowerCase()
      .replace(/[.-]/g, ' ')
      .replace(/[^a-z ]/g, '')
      .split(' ')
      .filter(c => c.length >= 2)
      .filter(Boolean)
  ))

  enrichTokens.forEach(({ token, concat }) => {
    const normalizedToken =
      token
        .toLowerCase()
        .replace(/[.-]/g, ' ')
        .replace(/[^a-z ]/g, '')

    if (tokens.includes(normalizedToken)) {
      tokens.concat(
        concat.map(
          token =>
            token
              .toLowerCase()
              .replace(/[.-]/g, ' ')
              .replace(/[^a-z ]/g, '')
        )
      )
    }
  })

  return tokens
}

const getCurrentLists = async (pgdb) => {
  const lists = await pgdb.query(`
    SELECT
      cards.payload->'party' "party",
      "cardGroups".name "district",
      cards.payload->'nationalCouncil'->>'listName' "listName"
    FROM cards
    JOIN "cardGroups" ON cards."cardGroupId" = "cardGroups".id
    WHERE cards.payload->'nationalCouncil'->>'listName' IS NOT NULL
    GROUP BY 1, 2, 3
    ORDER BY 1, 2, 3
    ;
  `)

  return lists.map(list => ({
    ...list,
    __normalizedDistrict: normalizeDistrict(list.district),
    __tokens: toTokens(`${list.listName}`)
  }))
}

/* const getPreviousLists = () => {
  const { kandidierende } = require('../data/sd-t-17.02-NRW2015-kandidierende.json')
  const data = {}

  _.shuffle(kandidierende).forEach(k => {
    const kanton = k.kanton_bezeichnung
    if (!data[kanton]) {
      data[kanton] = {}
    }

    const liste = k.liste_bezeichnung
    if (!data[kanton][liste]) {
      data[kanton][liste] = { mandate: 0 }
    }

    if (k.flag_gewaehlt) {
      data[kanton][liste].mandate += 1
    }
  })

  const results = []

  Object.keys(data).forEach(kanton => {
    const kantonData = data[kanton]
    Object.keys(kantonData).forEach(liste => {
      const listeData = kantonData[liste]
      results.push({
        district: kanton,
        listName: liste,
        seats: listeData.mandate,
        __normalizedDistrict: normalizeDistrict(kanton),
        __tokens: toTokens(`${liste}`)
      })
    })
  })

  return results
} */

const parties = require('../data/2015-parties-distrricts-lists-seats.json')

const partiesArray = Object.keys(parties).map(i => {
  return {
    ...parties[i]
  }
})

const unknownPartyLists = []

PgDb.connect().then(async pgdb => {
  const currentLists = await getCurrentLists(pgdb)
  // const previousLists = getPreviousLists()

  // const consolidatedLists = currentLists
  currentLists // _.shuffle(currentLists).slice(0, 1)
    /* .filter(currentList => {
      return currentList.district === 'Basel-Landschaft' &&
      currentList.listName === 'Evangelische Volkspartei - Zukunft'
    }) */
    .map(currentList => {
      const party = partiesArray.find(({ labels }) => labels.includes(currentList.party))
      if (!party) {
        unknownPartyLists.push(currentList)

        console.log(`${currentList.district}\t${currentList.party}\t${currentList.listName}`)
        return
        // console.warn(`List «${currentList.listName}» unbeknownst to party affilliations`)
        // return
      }

      const district = party.districts[currentList.district]
      if (!district) {
        // console.warn(`Party «${currentList.party}» had no list in «${currentList.district}» previously`)
        // return
        console.log(`${currentList.district}\t${currentList.party}\t${currentList.listName}`)
        return
      }

      const lists = district.lists
      const matchedLists = []

      Object
        .keys(lists)
        .forEach(name => {
          const tokens = toTokens(name)

          const maxMatches = Math.max(tokens.length, currentList.__tokens.length)
          let matches = 0

          tokens.forEach(token => {
            const hasTokenFound = currentList.__tokens.includes(token)
            matches += hasTokenFound ? 1 : 0
          })

          const score = Number(Number(1 / maxMatches * matches).toPrecision(2))

          if (score > 0) {
            matchedLists.push({
              listName: name,
              ...lists[name],
              score
            })
          }
        })

      if (matchedLists.length === 0) {
        console.log(`${currentList.district}\t${currentList.party}\t${currentList.listName}`)
        return
      }

      const fullMatchedList = matchedLists.find(l => l.score === 1)
      if (fullMatchedList) {
        console.log(`${currentList.district}\t${currentList.party}\t${currentList.listName}\t${fullMatchedList.listName}\t${fullMatchedList.votes}\t${fullMatchedList.seats}\t${String(fullMatchedList.score).replace('.', ',')}`)
        return
      }

      matchedLists.forEach(matchedList => {
        console.log(`${currentList.district}\t${currentList.party}\t${currentList.listName}\t${matchedList.listName}\t${matchedList.votes}\t${matchedList.seats}\t${String(matchedList.score).replace('.', ',')}`)
      })
    })

  /*
      const eligablePreviousLists =
        previousLists
          // Kantonsfilter
          .filter(previousList => previousList.__normalizedDistrict === currentList.__normalizedDistrict)
          // Listen-Token-Vergleichs-Schmeus
          .map(previousList => {
            // console.log(previousList.__normalizedDistrict, previousList.listName)

            const maxMatches = Math.max(previousList.__tokens.length, currentList.__tokens.length)
            let matches = 0

            previousList.__tokens.forEach(previousListToken => {
              const hasTokenFound = currentList.__tokens.find(currentListToken => currentListToken === previousListToken)
              matches += hasTokenFound ? 1 : 0
            })

            return {
              ...previousList,
              __score: Number(Number(1 / maxMatches * matches).toPrecision(2))
            }
          })
          .filter(previousList => previousList.__score > 0)

      const highestScore = Math.max.apply(Math, eligablePreviousLists.map(previousList => previousList.__score))
      const electedPreviousLists =
        eligablePreviousLists
          .filter(previousList => previousList.__score === highestScore)
          .map(previousList => {
            const { __normalizedDistrict, __tokens, ...rest} = previousList
            return rest
          })

      const { __normalizedDistrict, __tokens, ...rest} = currentList

      return {
        ...rest,
        __electedPreviousList: electedPreviousLists.length === 1 ? electedPreviousLists[0] : {},
        __electedPreviousLists: electedPreviousLists.length !== 1 ? electedPreviousLists : []
      }
    })
    */

  // [] console.log(JSON.stringify(consolidatedLists, null, 2))

  await pgdb.close()
})
