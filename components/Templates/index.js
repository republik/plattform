import newsletterSchema from '@project-r/template-newsletter'
import editorialNewsletterSchema from '@project-r/styleguide/lib/templates/EditorialNewsletter/web'
import neutrumSchema from './Neutrum'

import createArticleSchema from '@project-r/styleguide/lib/templates/Article'
import createFrontSchema from '@project-r/styleguide/lib/templates/Front'
import createFormatSchema from '@project-r/styleguide/lib/templates/Format'
import createDiscussionSchema from '@project-r/styleguide/lib/templates/Discussion'
import createDossierSchema from '@project-r/styleguide/lib/templates/Dossier'

import { t } from '../../lib/withT'

const schemas = {
  // first is default schema for the editor
  // - for Project R this should be the newsletter
  newsletter: newsletterSchema,
  editorialNewsletter: editorialNewsletterSchema(),
  neutrum: neutrumSchema,
  article: createArticleSchema({t}),
  front: createFrontSchema({t}),
  format: createFormatSchema({t}),
  discussion: createDiscussionSchema({t}),
  dossier: createDossierSchema({t})
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
