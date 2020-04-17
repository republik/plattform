const gsheets = require('gsheets')
const { utcTimeParse, timeParse } = require('@orbiting/backend-modules-formats')
const { slugify } = require('@orbiting/backend-modules-utils')

const dateParse = utcTimeParse('%x') // %x - the locale’s date
const dateTimeParse = timeParse('%x %H:%M')

const { GSHEETS_IMPORT } = process.env
const mapping = GSHEETS_IMPORT && JSON.parse(GSHEETS_IMPORT)

const normalize = data =>
  data.map(d => {
    return Object.assign({}, d, {
      published: d.hasOwnProperty('published') ? !!d.published : undefined,
      date: d.hasOwnProperty('date') ? dateParse(d.date) : undefined,
      dateTime: d.hasOwnProperty('dateTime')
        ? dateTimeParse(d.dateTime)
        : undefined,
      publishedDateTime: d.hasOwnProperty('publishedDateTime')
        ? dateTimeParse(d.publishedDateTime)
        : undefined,
      slug: d.hasOwnProperty('slug') ? slugify(d.slug) : undefined
    })
  })

module.exports = async (key, pgdb) => {
  if (!key) {
    throw new Error('key param missing')
  }
  if (!mapping) {
    throw new Error('mapping missing, check GSHEETS_IMPORT env var')
  }

  const name = mapping[key]
  if (!name) {
    throw new Error('invalid key')
  }
  console.info('gsheets: starting...', { key, name })

  let sheet
  try {
    sheet = await gsheets.getWorksheet(key, 'live')
  } catch (e) {
    console.error('gsheets: could not get sheet', {
      e,
      key
    })
    throw new Error('could not get sheet')
  }

  if (sheet) {
    const data = normalize(sheet.data)
    try {
      if (await pgdb.public.gsheets.count({ name })) {
        await pgdb.public.gsheets.update(
          { name },
          {
            data,
            updatedAt: new Date()
          }
        )
      } else {
        await pgdb.public.gsheets.insert({
          name,
          data,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }
    } catch (e) {
      console.error('gsheets: error while trying to save data', {
        e,
      })
      throw new Error('failed while trying to save data')
    }
  }

  console.info('gsheets: finished successfully!', { key, name })
}
