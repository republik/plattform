const {
  newsletterEmailSchema,
  editorialNewsletterSchema
} = require('@orbiting/backend-modules-styleguide')
const { renderEmail } = require('mdast-react-render/lib/email')

const get = doc => {
  const emailSchema = doc.content.meta.template === 'editorialNewsletter'
    ? editorialNewsletterSchema.default() // Because styleguide currently doesn't support module.exports
    : newsletterEmailSchema
  return renderEmail(doc.content, emailSchema)
}

module.exports = {
  get
}
