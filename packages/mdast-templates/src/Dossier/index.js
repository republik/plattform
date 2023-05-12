import React from 'react'

import { DossierTag } from '@project-r/styleguide/src/components/Dossier'

import createArticleSchema from '../Article'

const DefaultLink = ({ children }) => children

const createDossierSchema = ({
  dossierLabel = 'Dossier',
  dossierHref = '/dossier',
  customMetaFields = [],
  series = false,
  darkMode,
  paynotes = true,
  Link = DefaultLink,
  titleBlockPrepend = null,
  getPath = ({ slug }) => `/dossier/${(slug || '').split('/').pop()}`,
  hasEmailTemplate = false,
  ...args
} = {}) => {
  return createArticleSchema({
    repoPrefix: 'dossier-',
    getPath,
    hasEmailTemplate,
    titleBlockPrepend: [
      titleBlockPrepend,
      <DossierTag attributes={{ contentEditable: false }}>
        {dossierLabel}
      </DossierTag>,
    ],
    customMetaFields: [
      {
        label: 'Diskussion',
        key: 'discussion',
        ref: 'repo',
      },
      ...customMetaFields,
    ],
    series,
    darkMode,
    paynotes,
    Link,
    ...args,
  })
}

export default createDossierSchema
