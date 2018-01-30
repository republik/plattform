import React from 'react'

import {
  DossierTag
} from '../../components/Dossier'

import createArticleSchema from '../Article'
import { styles } from '../Article/utils'

const DefaultLink = ({ children }) => children

const createSchema = ({
  dossierLabel = 'Dossier',
  dossierHref = '/dossier',
  customMetaFields = [],
  series = false,
  Link = DefaultLink,
  titleBlockPrepend = null,
  getPath = ({ slug }) => `/dossier/${(slug || '').split('/').pop()}`,
  ...args
} = {}) => {
  return createArticleSchema({
    repoPrefix: 'dossier-',
    getPath,
    titleBlockPrepend: [
      titleBlockPrepend,
      <Link key='dossierLink' href={dossierHref} passHref>
        <a {...styles.link} href={dossierHref}>
          <DossierTag attributes={{contentEditable: false}}>
            {dossierLabel}
          </DossierTag>
        </a>
      </Link>
    ],
    customMetaFields: [
      {
        label: 'Diskussion',
        key: 'discussion',
        ref: 'repo'
      },
      ...customMetaFields
    ],
    series,
    Link,
    ...args
  })
}

export default createSchema
