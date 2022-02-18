import React from 'react'
import newsletterSchema from '@project-r/template-newsletter'
import neutrumSchema from './Neutrum'

import {
  createNewsletterWebSchema,
  createArticleSchema,
  createPageSchema,
  createFrontSchema,
  createFormatSchema,
  createSectionSchema,
  createDiscussionSchema,
  createDossierSchema,
} from '@project-r/styleguide'

import { t } from '../../lib/withT'

import dynamicComponentRequire from '../editor/modules/dynamiccomponent/require'
import dynamicComponentIdentifiers from '../editor/modules/dynamiccomponent/identifiers'
import * as withArticleData from './withArticleData'
import * as withFrontData from './withFrontData'

const NoOpLink = ({ children }) =>
  React.cloneElement(React.Children.only(children), {
    onClick: (e) => {
      e.preventDefault()
    },
  })

const articleSchemaParams = {
  t,
  dynamicComponentRequire,
  dynamicComponentIdentifiers,
  ...withArticleData,
}

const schemas = {
  // first is default schema for the editor
  // - for Project R this should be the newsletter
  newsletter: newsletterSchema,
  editorialNewsletter: createNewsletterWebSchema(),
  neutrum: neutrumSchema,
  article: createArticleSchema(articleSchemaParams),
  front: createFrontSchema({
    Link: NoOpLink,
    CommentLink: NoOpLink,
    DiscussionLink: NoOpLink,
    t,
    ...withFrontData,
  }),
  format: createFormatSchema(articleSchemaParams),
  section: createSectionSchema(articleSchemaParams),
  discussion: createDiscussionSchema(articleSchemaParams),
  dossier: createDossierSchema(articleSchemaParams),
  page: createPageSchema(articleSchemaParams),
}

export const getSchema = (template) => {
  const key = template || Object.keys(schemas)[0]
  const schema = schemas[key] || (key === 'editorial' && schemas.article)

  if (!schema) {
    throw new Error(`Unkown Schema ${key}`)
  }
  return schema
}

export default schemas
