const handler = require('@orbiting/backend-modules-assets/handlers/purgeTags')

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).end()
  }
  return handler(req, res)
}
