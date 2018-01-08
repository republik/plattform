const newsletterEmailSchema = require('@project-r/template-newsletter/lib/email')
const editorialNewsletterSchema = require('@project-r/styleguide/lib/templates/EditorialNewsletter/email')
const { renderEmail } = require('mdast-react-render/lib/email')

const getHTML = doc => {
  const emailSchema = doc.content.meta.template === 'editorialNewsletter'
    ? editorialNewsletterSchema.default()  // Because styleguide currently doesn't support module.exports
    : newsletterEmailSchema
  return renderEmail(doc.content, emailSchema)
}

module.exports = getHTML
