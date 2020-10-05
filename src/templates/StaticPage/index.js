import React from 'react'

import { DossierTag } from '../../components/Dossier'

import createArticleSchema from '../Article'

const DefaultLink = ({ children }) => children

const createSchema = ({
  documentEditorOptions,
  customMetaFields = [],
  series = false,
  darkMode,
  paynotes = true,
  Link = DefaultLink,
  titleBlockPrepend = null,
  getPath = ({ slug }) => `/${(slug || '').split('/').pop()}`,
  useInteractionsTypo = true,
  ...args
} = {}) => {
  return createArticleSchema({
    documentEditorOptions: { skipCredits: true, excludeFromFeed: true },
    repoPrefix: 'static-',
    getPath,
    customMetaFields: [
      {
        label: 'Diskussion',
        key: 'discussion',
        ref: 'repo'
      },
      ...customMetaFields
    ],
    series,
    darkMode,
    paynotes,
    Link,
    useInteractionsTypo,
    ...args
  })
}

export default createSchema
