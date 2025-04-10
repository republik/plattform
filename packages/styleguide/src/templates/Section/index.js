import React from 'react'

import SectionTitle from '../../components/TeaserShared/SectionTitle'
import TitleBlock from '../../components/TitleBlock'
import * as Interaction from '../../components/Typography/Interaction'

import createArticleSchema, { COVER_TYPE } from '../Article'

import {
  matchZone,
  matchHeading,
  matchParagraph,
} from '@republik/mdast-react-render'

const DefaultLink = ({ children }) => children

const createSectionSchema = ({
  Link = DefaultLink,
  customMetaFields = [],
  series = false,
  darkMode = true,
  titleBlockPrepend = null,
  titleMargin = true,
  titleBlockRule,
  getPath = ({ slug }) => `/${(slug || '').split('/').pop()}`,
  metaBody = true,
  hasEmailTemplate = false,
  ...args
} = {}) => {
  return createArticleSchema({
    Link,
    repoPrefix: 'section-',
    getPath,
    hasEmailTemplate,
    customMetaFields: [
      {
        label: 'Ebene',
        key: 'kind',
        items: [
          { value: 'editorial', text: 'Editorial' },
          { value: 'meta', text: 'Meta' },
          { value: 'scribble', text: 'Ameise' },
          { value: 'opinion', text: 'Kolumne' },
        ],
      },
      {
        label: 'Color',
        key: 'color',
      },
      {
        label: 'Diskussion',
        key: 'discussion',
        ref: 'repo',
      },
      ...customMetaFields,
    ],
    series,
    darkMode,
    metaBody,
    titleBlockRule: titleBlockRule || {
      matchMdast: matchZone('TITLE'),
      component: ({ children, ...props }) => (
        <TitleBlock {...props} center margin={titleMargin}>
          {titleBlockPrepend}
          {children}
        </TitleBlock>
      ),
      editorModule: 'title',
      editorOptions: {
        coverType: COVER_TYPE,
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
            isStatic: true,
          },
        },
        {
          matchMdast: matchParagraph,
          component: () => null,
        },
      ],
    },
    previewTeaser: (props) => (
      <div
        style={{
          backgroundColor: '#fff',
          padding: '30px',
        }}
      >
        <SectionTitle
          href='/'
          onClick={(e) => {
            e.preventDefault()
          }}
        >
          {props.title}
        </SectionTitle>
      </div>
    ),
    ...args,
  })
}

export default createSectionSchema
