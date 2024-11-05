const {
  createNewsletterEmailSchema,
  articleEmailSchema,
} = require('@republik/mdast-mail-templates')
const { renderEmail } = require('@republik/mdast-react-render/email')

const MissingNode = () => null

const get = (doc) => {
  const { template } = doc.content.meta
  if (template === 'article') {
    return renderEmail(doc.content, articleEmailSchema, { MissingNode })
  }
  const emailSchema = createNewsletterEmailSchema()
  return renderEmail(doc.content, emailSchema)
}

module.exports = {
  get,
}
