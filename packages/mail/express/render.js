const handlebars = require('handlebars')

const { getTemplate, envMergeVars } = require('../lib/sendMailTemplate')

module.exports = async (server, pgdb, t) => {
  server.get(
    '/mail/render/:template',
    async (req, res) => {
      const source = await getTemplate(req.params.template)

      if (!source) {
        return res.sendStatus(404)
      }

      const template = handlebars.compile(source, { noEscape: true })
      const vars = { ...req.query }

      envMergeVars.forEach(({ name, content }) => {
        vars[name] = content
      })

      return res.send(template(vars))
    }
  )
}
