import newsletterSchema from '@project-r/template-newsletter'
import neutrumSchema from './Neutrum'

import createEditorialSchema from '@project-r/styleguide/lib/templates/Editorial'
import createMetaSchema from '@project-r/styleguide/lib/templates/Meta'

const schemas = {
  newsletter: newsletterSchema,
  neutrum: neutrumSchema,
  editorial: createEditorialSchema(),
  meta: createMetaSchema()
}

export const getSchema = template => {
  const key = template || Object.keys(schemas)[0]
  const schema = schemas[key]

  if (!schema) {
    throw new Error(`Unkown Schema ${key}`)
  }
  return schema
}

export default schemas
