const {
  newsletterEmailSchema,
  createNewsletterEmailSchema,
} = require('@orbiting/backend-modules-styleguide')
const { renderEmail } = require('mdast-react-render/lib/email')

const get = (doc) => {
  const emailSchema =
    doc.content.meta.template === 'editorialNewsletter'
      ? createNewsletterEmailSchema() // Because styleguide currently doesn't support module.exports
      : newsletterEmailSchema
  return renderEmail(doc.content, emailSchema)
}

module.exports = {
  get,
}
