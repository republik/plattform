const { GoogleSpreadsheet } = require('google-spreadsheet')
const moment = require('moment')

const {
  GSHEETS_EXPORT,
  GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_PRIVATE_KEY
} = process.env

const mapping = GSHEETS_EXPORT && JSON.parse(GSHEETS_EXPORT)

module.exports = async (key, pgdb) => {
  if (!key) {
    throw new Error('key argument missing')
  }
  if (!mapping) {
    throw new Error('mapping missing, check GSHEETS_EXPORT env var')
  }

  const name = mapping[key]
  if (!name) {
    throw new Error('invalid key')
  }

  const { getRows } = require(`./${name}`)
  const rows = await getRows(pgdb)
  if (!rows || !rows.length) {
    throw new Error('no data to export found')
  }

  try {
    const doc = new GoogleSpreadsheet(key)

    await doc.useServiceAccountAuth({
      client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: GOOGLE_PRIVATE_KEY
        .replace(/@/g, '\n')
    })

    const newSheet = await doc.addSheet({
      // colons in spreadsheet titles are not allowed
      title: `${moment().format('DD.MM.YYYY HH_mm_ss')}`,
      headerValues: Object.keys(rows[0])
    })

    return newSheet.addRows(rows)
  } catch (e) {
    console.log(e)
    throw new Error('failed to update gsheet, check server logs')
  }
}
