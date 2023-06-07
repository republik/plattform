// Schema for Project-R newsletter
const { newsletterEmailSchema } = require('@republik/template-newsletter')
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
