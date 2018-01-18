import React from 'react'

import TitleBlock from '../../components/TitleBlock'
import * as Interaction from '../../components/Typography/Interaction'

import createArticleSchema, { COVER_TYPE } from '../Article'

import {
  matchZone,
  matchHeading,
  matchParagraph
} from 'mdast-react-render/lib/utils'

const DefaultLink = ({ children }) => children

const createSchema = ({
  Link = DefaultLink,
  customMetaFields = [],
  series = false,
  titleBlockPrepend = null,
  titleBlockAppend = null,
  titleBlockRule,
  ...args
} = {}) => {
  return createArticleSchema({
    repoPrefix: 'format-',
    customMetaFields: [
      {
        label: 'Ebene',
        key: 'kind',
        items: [
          {value: 'editorial', text: 'Editorial'},
          {value: 'meta', text: 'Meta'}
        ]
      },
      {
        label: 'Color',
        key: 'color'
      },
      {
        label: 'Dossier',
        key: 'dossier',
        ref: 'repo'
      },
      {
        label: 'Diskussion',
        key: 'discussion',
        ref: 'repo'
      },
      ...customMetaFields
    ],
    series,
    titleBlockRule: titleBlockRule || {
      matchMdast: matchZone('TITLE'),
      component: ({children, ...props}) => (
        <TitleBlock {...props} center Link={Link}>
          {titleBlockPrepend}
          {children}
          {titleBlockAppend}
        </TitleBlock>
      ),
      editorModule: 'title',
      editorOptions: {
        coverType: COVER_TYPE
      },
      rules: [
        {
          matchMdast: matchHeading(1),
          component: ({ children, attributes }) => {
            const Headline = Interaction.Headline
            return <Headline attributes={attributes}>{children}</Headline>
          },
          editorModule: 'headline',
          editorOptions: {
            type: 'H1',
            placeholder: 'Titel',
            depth: 1,
            isStatic: true
          }
        },
        {
          matchMdast: matchParagraph,
          component: () => null
        }
      ]
    },
    ...args
  })
}

export default createSchema
