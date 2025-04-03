import { cloneElement, Children } from 'react'

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

import { getDatePath } from '@project-r/styleguide/editor'
import { t } from '../../lib/withT'

import dynamicComponentRequire from '../editor/modules/dynamiccomponent/require'
import dynamicComponentIdentifiers from '../editor/modules/dynamiccomponent/identifiers'
import * as withArticleData from './withArticleData'
import * as withFrontData from './withFrontData'

const NoOpLink = (props) => {
  try {
    return cloneElement(Children.only(props.children), {
      onClick: (e) => {
        e.preventDefault()
      },
    })
  } catch {
    return <a {...props} onClick={(e) => e.preventDefault()} />
  }
}

const articleSchemaParams = {
  t,
  dynamicComponentRequire,
  dynamicComponentIdentifiers,
  ...withArticleData,
  noEmpty: false,
  hasEmailTemplate: true,
}

const schemas = {
  editorialNewsletter: createNewsletterWebSchema(),
  flyer: {
    getPath: getDatePath,
    repoPrefix: 'flyer-',
  },
  article: createArticleSchema(articleSchemaParams),
  front: createFrontSchema({
    Link: NoOpLink,
    CommentLink: NoOpLink,
    DiscussionLink: NoOpLink,
    t,
    noEmpty: false,
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
