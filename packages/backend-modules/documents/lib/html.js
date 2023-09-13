const {
  createNewsletterEmailSchema,
  articleEmailSchema,
} = require('@orbiting/backend-modules-styleguide')
const { renderEmail } = require('@republik/mdast-react-render')

const get = (doc) => {
  const { template } = doc.content.meta
  if (template === 'article') {
    return renderEmail(doc.content, articleEmailSchema)
  }
  const emailSchema = createNewsletterEmailSchema()
  return renderEmail(doc.content, emailSchema)
}

module.exports = {
  get,
}
