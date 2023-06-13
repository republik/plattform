const {
  createNewsletterEmailSchema,
} = require('@orbiting/backend-modules-styleguide')
const { renderEmail } = require('@republik/mdast-react-render')

const get = (doc) => {
  const emailSchema = createNewsletterEmailSchema()
  return renderEmail(doc.content, emailSchema)
}

module.exports = {
  get,
}
