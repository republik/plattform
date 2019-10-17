#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const { csvFormat } = require('d3-dsv')

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')

const questions = [
  { id: '1', column: 'Gesamteinnahmen' },
  { id: '1a', column: 'Beitrag Eigenmittel' },
  { id: '1b', column: 'Beitrag Privatpersonen' },
  { id: '1bI', column: 'Anzahl Privatpersonen' },
  { id: '1c', column: 'Beitrag Institutionen' },
  { id: '1cI', column: 'Liste Institutionen' },
  { id: '1cII', column: 'Indirekt über Institutionen' },
  { id: '1d', column: 'Beitrag Partei' },

  { id: '2', column: 'Gesamtausgaben' },
  { id: '2a', column: 'Betrag Werbung offline' },
  { id: '2b', column: 'Betrag Werbung online' },
  { id: '2c', column: 'Betrag Social Media' },
  { id: '2d', column: 'Betrag Partei' },

  { id: '3', column: 'Anmerkungen' }
]

PgDb.connect().then(async pgdb => {
  const cards = await pgdb.public.cards.findAll()
  const cardGroups = await pgdb.public.cardGroups.findAll()
  const users = await pgdb.public.users.find({ id: cards.map(card => card.userId) })

  const rows = []

  cards.forEach(card => {
    const { payload: {
      age,
      meta,
      financing,
      nationalCouncil,
      councilOfStates,
      lobbywatch,
      campaignBudgetSmartvote,
      campaignBudgetCommentSmartvote
    } } = card
    if (!financing || financing === {}) {
      return
    }

    const user = users.find(user => user.id === card.userId)
    const cardGroup = cardGroups.find(cardGroup => cardGroup.id === card.cardGroupId)

    const row = {
      cardId: card.id,
      party: card.payload.party,
      fraction: card.payload.fraction,
      cardGroup: cardGroup.name,
      profile: `https://www.republik.ch/~${user.username}`,
      name: [meta.firstName, meta.lastName].join(' '),
      age
    }

    questions.forEach(question => {
      row[question.column] = (financing[question.id] && financing[question.id].value) || null
    })

    row['Nationalrat: Kandidatur'] = nationalCouncil.candidacy ? 'Ja' : ''
    row['Nationalrat: Liste'] = nationalCouncil.listName
    row['Nationalrat: Mandate (ähnliche) Liste 2015'] = nationalCouncil.listMandatesPreviously
    row['Nationalrat: Listenplatz'] = nationalCouncil.minListPlace
    row['Nationalrat: Anzahl Listenplätze'] = nationalCouncil.listPlaces.length
    row['Nationalrat: alle Listenplätze'] = nationalCouncil.listPlaces.join(', ')
    row['Nationalrat: Rating'] = nationalCouncil.electionPlausibility
    row['Nationalrat: Mitglied'] = nationalCouncil.incumbent ? 'Ja' : ''

    row['Ständerat: Kandidatur'] = councilOfStates.candidacy ? 'Ja' : ''
    row['Ständerat: Mitglied'] = councilOfStates.incumbent ? 'Ja' : ''

    row['Lobbywatch: Transparenz'] = lobbywatch.transparencyLevel

    row['Smartvote: Budget'] = campaignBudgetSmartvote
    row['Smartvote: Kommentar'] = campaignBudgetCommentSmartvote

    rows.push(row)
  })

  console.log(csvFormat(rows))

  await pgdb.close()
})
