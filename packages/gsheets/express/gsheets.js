const router = require('express').Router()
const importSheet = require('../lib/import')
const exportToSheet = require('../lib/export')

const {
  GSHEETS_IMPORT,
  GSHEETS_EXPORT
} = process.env

module.exports = (server, pgdb) => {
  if (!GSHEETS_IMPORT) {
    console.warn('missing env GSHEETS_IMPORT, importing via the /gsheets endpoint will not work')
  } else {
    server.use(
      router.get('/gsheets/:key', async (req, res) => {
        const { key } = req.params

        await importSheet(key, pgdb)
          .catch( e => {
            return res.status(400).end(e.message)
          })
          .then( () => {
            return res.status(200).end('success! new data published!')
          })
      })
    )
  }

  if (!GSHEETS_EXPORT) {
    console.warn('missing env GSHEETS_EXPORT, exporting via the /gsheets-export endpoint will not work')
  } else {
    server.use(
      router.get('/gsheets-export/:key', async (req, res) => {
        const { key } = req.params

        await exportToSheet(key, pgdb)
          .catch( e => {
            console.log(e)
            return res.status(400).end(e.message)
          })
          .then( () => {
            return res.status(200).end('success! new data published!')
          })
      })
    )
  }

  return server
}
