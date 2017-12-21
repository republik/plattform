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
  Link = DefaultLink,
  titleBlockPrepend = null,
  ...args
} = {}) => {
  return createArticleSchema({
    repoPrefix: 'dossier-',
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
    ...args
  })
}

export default createSchema
