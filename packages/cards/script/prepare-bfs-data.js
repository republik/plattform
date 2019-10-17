#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const { dsvFormat } = require('d3-dsv')
const fs = require('fs').promises
const path = require('path')

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')

const parse = dsvFormat(';').parse

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

const normalizeDistrict = (string) => {
  return districtMap[string] || string
}

PgDb.connect().then(async pgdb => {
  const input = await fs.readFile(
    path.join(__dirname, '../data/sd-t-17.02-NRW2015-kandidierende-appendix.csv'),
    'utf-8'
  )

  const data = parse(input)

  // Parties -> ID
  const parties = {}

  /*
    {
    wahl_jahr: '2015',
    kanton_nummer: '1',
    kanton_bezeichnung: 'Zürich',
    liste_nummer_kanton: '3',
    liste_bezeichnung: 'FDP.Die Liberalen',
    kandidat_nummer: '30',
    name: 'Jost',
    vorname: 'Roland',
    geschlecht: 'M',
    geburtsjahr: '1957',
    wohnort_gemeinde_nummer: '261',
    wohnort: 'Zürich',
    beruf: '',
    kandidat_status_id: '0',
    kandidat_status_de: '',
    kandidat_status_fr: '',
    kandidat_status_it: '',
    kandidat_status_en: '',
    kandidat_partei_id: '1',
    partei_bezeichnung_de: 'FDP',
    partei_bezeichnung_fr: 'PLR',
    partei_bezeichnung_it: 'PLR',
    partei_bezeichnung_en: 'FDP',
    flag_gewaehlt: '0',
    stimmen_kandidat: '54406'
  },
  */

  data.forEach(row => {
    const partyId = Number(row.kandidat_partei_id)
    const district = normalizeDistrict(row.kanton_bezeichnung)
    const listName = row.liste_bezeichnung

    if (!parties[partyId]) {
      parties[partyId] = {
        labels: [
          row.partei_bezeichnung_de,
          row.partei_bezeichnung_fr,
          row.partei_bezeichnung_it,
          row.partei_bezeichnung_en
        ],
        districts: {}
      }
    }

    if (!parties[partyId].districts[district]) {
      parties[partyId].districts[district] = { lists: {} }
    }

    if (!parties[partyId].districts[district].lists[listName]) {
      parties[partyId].districts[district].lists[listName] = {
        votes: 0,
        seats: 0
      }
    }

    parties[partyId].districts[district].lists[listName].votes += Number(row.stimmen_kandidat)

    if (row.flag_gewaehlt === '1') {
      parties[partyId].districts[district].lists[listName].seats++
    }

    /*
    if (!parties[row.partei_bezeichnung_de]) {
      parties[row.partei_bezeichnung_de] = Number(row.kandidat_partei_id)
    }
    if (!parties[row.partei_bezeichnung_fr]) {
      parties[row.partei_bezeichnung_fr] = Number(row.kandidat_partei_id)
    }
    if (!parties[row.partei_bezeichnung_it]) {
      parties[row.partei_bezeichnung_it] = Number(row.kandidat_partei_id)
    }
    if (!parties[row.partei_bezeichnung_en]) {
      parties[row.partei_bezeichnung_en] = Number(row.kandidat_partei_id)
    }
    */
  })

  console.log(JSON.stringify(parties, null, 2))

  await pgdb.close()
})
