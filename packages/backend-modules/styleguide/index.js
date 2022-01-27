// Schema for Project-R newsletter
const newsletterEmailSchema = require('@project-r/template-newsletter/lib/email')
const {
  createCommentEmailSchema,
  createNewsletterEmailSchema,
  inQuotes,
} = require('@project-r/styleguide')

module.exports = {
  createCommentEmailSchema,
  newsletterEmailSchema,
  createNewsletterEmailSchema,
  inQuotes,
}
