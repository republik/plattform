import React from 'react'

import colors from '../../theme/colors'
import { FormatTag } from '../../components/Format'
import TitleBlock from '../../components/TitleBlock'
import * as Interaction from '../../components/Typography/Interaction'
import * as Editorial from '../../components/Typography/Editorial'

import createArticleSchema, { COVER_TYPE } from '../Article'
import { styles } from '../Article/utils'

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
  darkMode = true,
  paynotes = false,
  titleBlockPrepend = null,
  titleMargin = true,
  titleBlockRule,
  getPath = ({ slug }) => `/format/${(slug || '').split('/').pop()}`,
  metaBody = true,
  ...args
} = {}) => {
  return createArticleSchema({
    Link,
    repoPrefix: 'format-',
    getPath,
    customMetaFields: [
      {
        label: 'Ebene',
        key: 'kind',
        items: [
          { value: 'editorial', text: 'Editorial' },
          { value: 'meta', text: 'Meta' },
          { value: 'scribble', text: 'Ameise' },
          { value: 'opinion', text: 'Kolumne' }
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
      {
        label: 'Rubrik',
        key: 'section',
        ref: 'repo'
      },
      ...customMetaFields
    ],
    series,
    darkMode,
    paynotes,
    metaBody,
    titleBlockRule: titleBlockRule || {
      matchMdast: matchZone('TITLE'),
      component: ({ children, section, ...props }) => (
        <TitleBlock {...props} center margin={titleMargin}>
          {titleBlockPrepend}
          {section && section.meta && (
            <Editorial.Format
              color={section.meta.color || colors[section.meta.kind]}
              contentEditable={false}
            >
              <Link href={section.meta.path} passHref>
                <a {...styles.link} href={section.meta.path}>
                  {section.meta.title}
                </a>
              </Link>
            </Editorial.Format>
          )}
          {children}
        </TitleBlock>
      ),
      props: (node, index, parent, { ancestors }) => ({
        ...node.data,
        section: ancestors[ancestors.length - 1].section
      }),
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
    previewTeaser: props => (
      <div
        style={{
          backgroundColor: '#fff',
          padding: '30px'
        }}
      >
        <FormatTag
          label={props.title}
          count={17}
          color={
            props.color
              ? props.color
              : props.kind
              ? colors[props.kind]
              : undefined
          }
        />
      </div>
    ),
    ...args
  })
}

export default createSchema
