import newsletterSchema from '@project-r/template-newsletter'
import neutrumSchema from './Neutrum'

const schemas = {
  newsletter: newsletterSchema,
  neutrum: neutrumSchema
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
