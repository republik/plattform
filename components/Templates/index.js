import newsletterSchema from '@project-r/template-newsletter'
import editorialNewsletterSchema from '@project-r/styleguide/lib/templates/EditorialNewsletter/web'
import neutrumSchema from './Neutrum'

import createArticleSchema from '@project-r/styleguide/lib/templates/Article'
import createFrontSchema from '@project-r/styleguide/lib/templates/Front'

const schemas = {
  editorialNewsletter: editorialNewsletterSchema(),
  newsletter: newsletterSchema,
  neutrum: neutrumSchema,
  article: createArticleSchema(),
  front: createFrontSchema()
}

export const getSchema = template => {
  const key = template || Object.keys(schemas)[0]
  const schema = schemas[key] || (key === 'editorial' && schemas.article)

  if (!schema) {
    throw new Error(`Unkown Schema ${key}`)
  }
  return schema
}

export default schemas
