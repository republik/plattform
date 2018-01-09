const router = require('express').Router()
const gsheets = require('gsheets')
const { utcTimeParse, timeParse } = require('@orbiting/backend-modules-formats')
const slugify = require('../lib/slugify')

const dateParse = utcTimeParse('%x') // %x - the locale’s date
const dateTimeParse = timeParse('%x %H:%M')

const { GSHEETS } = process.env

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

module.exports = (server, pgdb) => {
  if (!GSHEETS) {
    console.warn('missing env GSHEETS, the /gsheets endpoint will not work')
    return
  }
  const mapping = JSON.parse(GSHEETS)
  return server.use(
    router.get('/gsheets/:key', async function (req, res) {
      const { key } = req.params
      const name = mapping[key]
      if (!key || !name) {
        console.error('gsheets: no key', { req: req._log() })
        return res.status(400).end('invalid key')
      }
      console.info('gsheets: starting...', { key, name })

      let sheet
      try {
        sheet = await gsheets.getWorksheet(key, 'live')
      } catch (e) {
        console.error('gsheets: could not get sheet', {
          e,
          key,
          req: req._log()
        })
        return res.status(400).end('could not get sheet')
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
            req: req._log()
          })
          return res.status(400).end('failed while trying to save data')
        }
      }
      console.info('gsheets: finished successfully!', { key, name })

      res.status(200).end('success! new data published!')
    })
  )
}
