const router = require('express').Router()
const importSheet = require('../lib/import')
const exportToSheet = require('../lib/export')

const {
  GSHEETS_IMPORT,
  GSHEETS_EXPORT
} = process.env

module.exports = (server, pgdb) => {
  if (!GSHEETS_IMPORT) {
    console.warn('missing env GSHEETS_IMPORT, importing via the /gsheets/import endpoint will not work')
  } else {
    const importCallback = async (req, res) => {
      const { key } = req.params
      await importSheet(key, pgdb)
        .catch( e => { return res.status(400).end(e.message) })
        .then( () => { return res.status(200).end('success! new data published!') })
    }
    router.get('/:key', importCallback)
    router.get('/import/:key', importCallback)
  }

  if (!GSHEETS_EXPORT) {
    console.warn('missing env GSHEETS_EXPORT, exporting via the /gsheets/export endpoint will not work')
  } else {
    const exportCallback = async (req, res) => {
      const { key } = req.params
      await exportToSheet(key, pgdb)
        .catch( e => {
          console.log(e)
          return res.status(400).end(e.message)
        })
        .then( () => {
          return res.status(200).end('success! new data published!')
        })
    }
    router.get('/export/:key', exportCallback)
  }

  return server.use('/gsheets', router)
}
