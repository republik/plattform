import newsletterSchema from '@project-r/template-newsletter'
import neutrumSchema from './Neutrum'

import createArticleSchema from '@project-r/styleguide/lib/templates/Article'

const schemas = {
  newsletter: newsletterSchema,
  neutrum: neutrumSchema,
  article: createArticleSchema()
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
