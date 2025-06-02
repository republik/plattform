import React from 'react'

import { DossierTag } from '../../components/Dossier'

import createArticleSchema from '../Article'

const DefaultLink = ({ children }) => children

const createDossierSchema = ({
  dossierLabel = 'Dossier',
  dossierHref = '/dossier',
  customMetaFields = [],
  series = false,
  darkMode,
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
    Link,
    ...args,
  })
}

export default createDossierSchema
