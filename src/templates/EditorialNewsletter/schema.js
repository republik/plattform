import React from 'react'
import { Link, Br } from './email/Paragraph'
import HR from './email/HR'
import Blockquote, {
  BlockquoteText,
  BlockquoteSource
} from './email/Blockquote'

import {
  matchType,
  matchZone,
  matchHeading,
  matchParagraph,
  matchImageParagraph
} from 'mdast-react-render/lib/utils'

import { FigureImage } from '../../components/Figure'

import { getDatePath, matchFigure, extractImage } from '../Article/utils'

const matchLast = (node, index, parent) => index === parent.children.length - 1

const createNewsletterSchema = ({
  H2,
  Paragraph,
  Container,
  Cover,
  CoverImage,
  Center,
  Figure,
  Image,
  Caption,
  Byline,
  Sub,
  Sup,
  Button,
  List,
  ListItem,
  ListP
} = {}) => {
  const globalInlines = [
    {
      matchMdast: matchType('break'),
      component: Br,
      isVoid: true
    },
    {
      matchMdast: matchType('sub'),
      component: Sub,
      editorModule: 'mark',
      editorOptions: {
        type: 'sub'
      }
    },
    {
      matchMdast: matchType('sup'),
      component: Sup,
      editorModule: 'mark',
      editorOptions: {
        type: 'sup'
      }
    }
  ]

  const link = {
    matchMdast: matchType('link'),
    component: Link,
    props: node => ({
      title: node.title,
      href: node.url
    }),
    editorModule: 'link'
  }

  const createParagraphRule = customComponent => {
    return {
      matchMdast: matchParagraph,
      component: customComponent || Paragraph,
      editorModule: 'paragraph',
      editorOptions: {
        formatButtonText: 'Paragraph'
      },
      rules: [
        ...globalInlines,
        link,
        {
          matchMdast: matchType('strong'),
          component: ({ attributes, children }) => (
            <strong {...attributes}>{children}</strong>
          ),
          editorModule: 'mark',
          editorOptions: {
            type: 'STRONG',
            mdastType: 'strong'
          }
        },
        {
          matchMdast: matchType('emphasis'),
          component: ({ attributes, children }) => (
            <em {...attributes}>{children}</em>
          ),
          editorModule: 'mark',
          editorOptions: {
            type: 'EMPHASIS',
            mdastType: 'emphasis'
          }
        }
      ]
    }
  }

  const paragraph = createParagraphRule()
  const listParagraph = createParagraphRule(ListP)

  const figureCaption = {
    matchMdast: matchParagraph,
    component: Caption,
    editorModule: 'figureCaption',
    editorOptions: {
      isStatic: true,
      afterType: 'PARAGRAPH',
      insertAfterType: 'CENTER',
      placeholder: 'Legende'
    },
    rules: [
      {
        matchMdast: matchType('emphasis'),
        component: Byline,
        editorModule: 'paragraph',
        editorOptions: {
          type: 'BYLINE',
          placeholder: 'Credit'
        }
      },
      link,
      ...globalInlines
    ]
  }

  const figure = {
    matchMdast: matchFigure,
    component: Figure,
    editorModule: 'figure',
    editorOptions: {
      pixelNote: 'Auflösung: min. 1200x (proportionaler Schnitt)',
      insertButtonText: 'Bild',
      insertTypes: ['PARAGRAPH'],
      type: 'CENTERFIGURE'
    },
    rules: [
      {
        matchMdast: matchImageParagraph,
        component: Image,
        props: (node, index, parent) => {
          const src = extractImage(node)
          const displayWidth = 600

          return {
            ...FigureImage.utils.getResizedSrcs(src, displayWidth),
            alt: node.children[0].alt
          }
        },
        editorModule: 'figureImage',
        isVoid: true
      },
      figureCaption
    ]
  }

  const cover = {
    matchMdast: (node, index, parent) => {
      return matchFigure(node) && index === 0
    },
    component: Cover,
    editorModule: 'figure',
    editorOptions: {
      type: 'COVERFIGURE',
      afterType: 'PARAGRAPH',
      pixelNote: 'Auflösung: min. 2000x (proportionaler Schnitt)'
    },
    rules: [
      {
        matchMdast: matchImageParagraph,
        component: CoverImage,
        props: (node, index, parent) => {
          const src = extractImage(node)
          const displayWidth = 1280
          const setMaxWidth = parent.data.size !== undefined

          return {
            ...FigureImage.utils.getResizedSrcs(src, displayWidth, setMaxWidth),
            alt: node.children[0].alt
          }
        },
        editorModule: 'figureImage',
        editorOptions: {
          type: 'COVERFIGUREIMAGE'
        },
        isVoid: true
      },
      figureCaption
    ]
  }

  return {
    emailTemplate: 'newsletter-editorial',
    repoPrefix: 'newsletter-editorial-',
    getPath: getDatePath,
    rules: [
      {
        matchMdast: matchType('root'),
        component: Container,
        editorModule: 'documentPlain',
        props: node => ({
          meta: node.meta || {}
        }),
        rules: [
          {
            matchMdast: () => false,
            editorModule: 'meta',
            editorOptions: {
              customFields: [
                {
                  label: 'Format',
                  key: 'format',
                  ref: 'repo'
                }
              ],
              additionalFields: ['emailSubject']
            }
          },
          cover,
          {
            matchMdast: matchZone('CENTER'),
            component: Center,
            editorModule: 'center',
            props: (mdast, index, parent, { ancestors }) => ({
              meta: ancestors[ancestors.length - 1].meta || {}
            }),
            rules: [
              paragraph,
              figure,
              {
                matchMdast: matchHeading(2),
                component: H2,
                editorModule: 'headline',
                editorOptions: {
                  type: 'h2',
                  depth: 2,
                  formatButtonText: 'Zwischentitel'
                }
              },
              {
                matchMdast: matchZone('BUTTON'),
                component: Button,
                props: (node, index, parent, { ancestors }) => {
                  const link =
                    (node.children[0] && node.children[0].children[0]) || {}

                  return {
                    ...node.data,
                    title: link.title,
                    href: link.url
                  }
                },
                rules: globalInlines.concat({
                  matchMdast: matchParagraph,
                  component: ({ children }) => children,
                  rules: [
                    {
                      matchMdast: matchType('link'),
                      component: ({ children }) => children,
                      rules: globalInlines
                    }
                  ]
                }),
                editorModule: 'button'
              },
              {
                matchMdast: matchZone('QUOTE'),
                component: Blockquote,
                editorModule: 'quote',
                editorOptions: {
                  insertButtonText: 'Zitat'
                },
                rules: [
                  {
                    matchMdast: (node, index, parent) =>
                      matchParagraph(node) &&
                      (index === 0 || !matchLast(node, index, parent)),
                    component: BlockquoteText,
                    editorModule: 'paragraph',
                    editorOptions: {
                      type: 'QUOTEP',
                      placeholder: 'Zitat'
                    },
                    rules: [paragraph]
                  },
                  {
                    matchMdast: (node, index, parent) =>
                      matchParagraph(node) && matchLast(node, index, parent),
                    component: BlockquoteSource,
                    editorModule: 'paragraph',
                    editorOptions: {
                      type: 'QUOTECITE',
                      placeholder: 'Quellenangabe / Autor'
                    },
                    rules: [paragraph]
                  }
                ]
              },
              {
                matchMdast: matchType('list'),
                component: List,
                props: node => ({
                  data: {
                    ordered: node.ordered,
                    start: node.start
                  }
                }),
                editorModule: 'list',
                rules: [
                  {
                    matchMdast: matchType('listItem'),
                    component: ListItem,
                    editorModule: 'listItem',
                    rules: [listParagraph]
                  }
                ]
              },
              {
                matchMdast: matchType('thematicBreak'),
                component: HR,
                editorModule: 'line',
                editorOptions: {
                  insertButtonText: 'Trennlinie',
                  insertTypes: ['PARAGRAPH']
                },
                isVoid: true
              }
            ]
          },
          {
            matchMdast: () => false,
            editorModule: 'specialchars'
          }
        ]
      }
    ]
  }
}

export default createNewsletterSchema
