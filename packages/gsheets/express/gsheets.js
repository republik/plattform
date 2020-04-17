const router = require('express').Router()
const importSheet = require('../lib/import')

const { GSHEETS_IMPORT } = process.env

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

  return server
}
