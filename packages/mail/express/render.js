const { getTemplate } = require('../lib/sendMailTemplate')

module.exports = async (server, pgdb, t) => {
  server.get(
    '/mail/render/:template',
    async (req, res) => {
      const html = await getTemplate(req.params.template)

      if (!html) {
        return res.sendStatus(404)
      }

      return res.send(html)
    }
  )
}
