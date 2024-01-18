const { getTemplates, envMergeVars } = require('../lib/sendMailTemplate')

module.exports = async (server) => {
  server.get('/mail/render/:template', async (req, res) => {
    const { html: template } = await getTemplates(req.params.template)

    if (!template) {
      return res.sendStatus(404)
    }

    const mail = envMergeVars.reduce((template, mergeVar) => {
      const { name, content } = mergeVar
      return template.replace(new RegExp(`{{?${name}?}}`, 'ig'), content)
    }, template)

    return res.send(mail)
  })
}
