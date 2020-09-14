const commentSchema = require('@project-r/styleguide/lib/templates/Comment/email').default()
const newsletterEmailSchema = require('@project-r/template-newsletter/lib/email')
const editorialNewsletterSchema = require('@project-r/styleguide/lib/templates/EditorialNewsletter/email')
const { inQuotes } = require('@project-r/styleguide/lib/lib/inQuotes')

module.exports = {
  commentSchema,
  newsletterEmailSchema,
  editorialNewsletterSchema,
  inQuotes,
}
