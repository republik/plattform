const { purgeTags } = require('@orbiting/backend-modules-keyCDN')

const {
  PURGE_PSK
} = process.env

module.exports = (server) => {
  if (!PURGE_PSK) {
    console.warn('missing env PURGE_PSK, the /purgeTags endpoint will not work')
    return
  }
  server.post('/purgeTags', async (req, res) => {
    const {
      tags,
      psk
    } = req.query

    if (!psk || psk !== PURGE_PSK) {
      console.warn('missing or incorrect PSK')
      return res.status(403).end()
    }

    const result = await purgeTags(tags.split(','))
      .catch(error => {
        console.error('purge failed', { error })
        return res.status(404).end()
      })
    if (!result.ok) {
      console.error('purge failed', result.url, result.status)
      return res.status(result.status).end()
    }

    return res.status(200).end()
  })
}
