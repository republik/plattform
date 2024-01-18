const { getTemplates, envMergeVars } = require('../lib/sendMailTemplate')
const handlebars = require('handlebars')

function convertValToBoolean(val) {
  const lcVal = val.toLowerCase()
  if (lcVal === 'true' || lcVal === 'false') {
    return Boolean(lcVal.toLowerCase())
  }
  return val
}

/**
 * Convert the query-param object to the format of the 'envMergeVars' const
 * { name: "Olivier" } -> [{name:"name", content: "Olivier"}]
 */
function convertVarObject(queryParams) {
  if (typeof queryParams !== 'object' || queryParams === null) {
    return []
  }
  return Object.keys(queryParams)
    .map((key) => ({
      name: key,
      content: convertValToBoolean(queryParams[key]),
    }))
    .filter(Boolean)
}

module.exports = async (server) => {
  server.get('/mail/render/:template', async (req, res) => {
    const { html: template } = await getTemplates(req.params.template)
    const queryMergeVars = convertVarObject(req?.query || {})

    if (!template) {
      return res.sendStatus(404)
    }

    const variables = [...envMergeVars, ...queryMergeVars].filter(
      () => (value, index, self) => {
        return self.indexOf(value) === index
      },
    )
    const variablesObject = variables.reduce(
      (acc, cur) => ({
        ...acc,
        [cur.name]: cur.content,
      }),
      {},
    )

    const getHTML = handlebars.compile(template)
    const html = getHTML(variablesObject)

    return res.send(html)
  })
}
