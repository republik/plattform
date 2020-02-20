#!/usr/bin/env node

require('@orbiting/backend-modules-env').config()
require('isomorphic-unfetch') // for gsheets
const gsheets = require('gsheets')
const Promise = require('bluebird')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const moment = require('moment')
const omit = require('lodash/omit')

const SPREADSHEET_ID = '10rwn0TEITbrh--V-f2hvvP7y_uFfYy_3CotzqDGZRV8'
const WORKSHEET_TITLE = 'Kampa-Game'

const slug = '101-reasons'

Promise.props({
  pgdb: PgDb.connect()
}).then(async (connections) => {
  const { pgdb } = connections

  const spreadsheet = await gsheets.getSpreadsheet(SPREADSHEET_ID)

  const worksheet = spreadsheet.worksheets.find(s => s.title === WORKSHEET_TITLE)

  if (!worksheet) {
    console.error(`Error: worksheet with name: ${WORKSHEET_TITLE} not found!`)
    return
  }

  const sheet = await gsheets.getWorksheetById(SPREADSHEET_ID, worksheet.id)

  const now = moment()
  const questionnaire = await pgdb.public.questionnaires.findOne({ slug }) ||
    await pgdb.public.questionnaires.insertAndGet({
      slug,
      description: slug,
      beginDate: now,
      endDate: moment(now).add(99, 'year'),
      allowedRoles: [],
      liveResult: true,
      submitAnswersImmediately: true,
      updateResultIncrementally: true,
      noEmptyAnswers: true
    })

  let counter = 0
  await Promise.each(
    sheet.data,
    async (row) => {
      const { id, description: text } = row
      const props = {
        questionnaireId: questionnaire.id,
        order: counter++,
        text,
        metadata: omit(row, ['id', 'description']),
        type: 'Choice',
        typePayload: {
          cardinality: 1,
          options: [
            { label: 'Ja', value: 'true' },
            { label: 'Nein', value: 'false' }
          ]
        }
      }
      if (!await pgdb.public.questions.count({ id })) {
        return pgdb.public.questions.insert(
          {
            id,
            ...props
          }
        )
      } else {
        return pgdb.public.questions.updateOne(
          { id },
          props
        )
      }
    }
  )

  console.log('done')
  return connections
})
  .then(async ({ pgdb }) => {
    await PgDb.disconnect(pgdb)
  }).catch(e => {
    console.error(e)
    process.exit(1)
  })
