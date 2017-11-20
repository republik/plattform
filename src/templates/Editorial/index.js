import React from 'react'

import Center from '../../components/Center'
import TitleBlock from '../../components/TitleBlock'
import * as Editorial from '../../components/Typography/Editorial'

import { Figure } from '../../components/Figure'
import FigureImage from '../../components/Figure/Image'
import FigureCaption from '../../components/Figure/Caption'
import FigureByline from '../../components/Figure/Byline'

import { PullQuote, PullQuoteText, PullQuoteSource } from '../../components/PullQuote'

import {
  InfoBox, InfoBoxTitle, InfoBoxText/*, InfoBoxFigure */
} from '../../components/InfoBox'


import {
  matchType,
  matchZone,
  matchHeading,
  matchParagraph,
  matchImageParagraph
} from 'mdast-react-render/lib/utils'

const matchLast = (node, index, parent) => index === parent.children.length - 1

const Strong = ({ children, attributes = {} }) =>
  <strong {...attributes}>{ children }</strong>

const link = {
  matchMdast: matchType('link'),
  props: node => ({
    data: {
      title: node.title,
      href: node.url
    }
  }),
  component: Editorial.AuthorLink,
  editorModule: 'link'
}

const br = {
  matchMdast: matchType('break'),
  component: () => <br />,
  isVoid: true
}

const paragraph = {
  matchMdast: matchParagraph,
  component: Editorial.P,
  editorModule: 'paragraph',
  editorOptions: {
    formatButtonText: 'Paragraph'
  },
  rules: [
    br,
    {
      matchMdast: matchType('strong'),
      component: Strong,
      editorModule: 'mark',
      editorOptions: {
        type: 'strong'
      }
    },
    link
  ]
}

const figure = {
  matchMdast: matchZone('FIGURE'),
  component: Figure,
  editorModule: 'figure',
  editorOptions: {
    documentChild: true,
    afterType: 'PARAGRAPH'
  },
  rules: [
    {
      matchMdast: matchImageParagraph,
      component: FigureImage,
      props: node => ({
        data: {
          src: node.children[0].url,
          alt: node.children[0].alt
        }
      }),
      editorModule: 'figureImage',
      isVoid: true
    },
    {
      matchMdast: matchParagraph,
      component: FigureCaption,
      props: (node, parent) => ({
        data: (parent && parent.data) || {}
      }),
      // ToDo: replace with module that enforces a byline at the end
      editorModule: 'paragraph',
      editorOptions: {
        type: 'figureCaption',
        placeholder: 'Legende'
      },
      rules: [
        {
          matchMdast: matchType('emphasis'),
          component: FigureByline,
          // ToDo: inline module with placeholder
          editorOptions: {
            placeholder: 'Credit'
          }
        },
        link,
        br
      ]
    }
  ]
}

const schema = {
  rules: [
    {
      matchMdast: matchType('root'),
      component: ({children}) => <div>{children}</div>,
      editorModule: 'documentPlain',
      rules: [
        {
          matchMdast: () => false,
          editorModule: 'meta'
        },
        {
          matchMdast: matchZone('TITLE'),
          component: TitleBlock,
          editorModule: 'block',
          editorOptions: {
            type: 'title'
          },
          rules: [
            {
              matchMdast: matchHeading(1),
              component: Editorial.Headline,
              editorModule: 'headline',
              editorOptions: {
                type: 'h1',
                placeholder: 'Titel',
                depth: 1
              }
            },
            {
              matchMdast: (node, index) => matchParagraph(node) && index === 1,
              component: Editorial.Lead,
              editorModule: 'paragraph',
              editorOptions: {
                type: 'lead',
                placeholder: 'Lead'
              },
              rules: [
                br,
                link
              ]
            },
            {
              matchMdast: matchParagraph,
              component: Editorial.Credit,
              editorModule: 'paragraph',
              editorOptions: {
                type: 'credit',
                placeholder: 'Autoren, Datum'
              },
              rules: [
                br,
                link
              ]
            }
          ]
        },
        figure,
        {
          matchMdast: matchZone('CENTER'),
          component: Center,
          editorModule: 'center',
          rules: [
            {
              matchMdast: matchHeading(2),
              component: Editorial.Subhead,
              editorModule: 'headline',
              editorOptions: {
                type: 'h2',
                depth: 2,
                formatButtonText: 'Zwischentitel'
              }
            },
            paragraph,
            figure,
            {
              matchMdast: matchZone('INFOBOX'),
              component: InfoBox,
              editorModule: 'block',
              editorOptions: {
                type: 'infobox',
                insertButtonText: 'Infobox'
              },
              rules: [
                {
                  matchMdast: matchHeading(3),
                  component: InfoBoxTitle,
                  editorModule: 'headline',
                  editorOptions: {
                    type: 'infoh',
                    depth: 3,
                    placeholder: 'Title'
                  }
                },
                {
                  matchMdast: matchParagraph,
                  component: InfoBoxText,
                  editorModule: 'paragraph',
                  editorOptions: {
                    type: 'infop',
                    placeholder: 'Text'
                  },
                  rules: paragraph.rules
                }
              ]
            },
            {
              matchMdast: matchZone('QUOTE'),
              component: PullQuote,
              editorModule: 'block',
              editorOptions: {
                type: 'quote',
                insertButtonText: 'Quote'
              },
              rules: [
                {
                  matchMdast: (node, index, parent) => (
                    matchParagraph(node) &&
                    (index === 0 || !matchLast(node, index, parent))
                  ),
                  component: PullQuoteText,
                  editorModule: 'paragraph',
                  editorOptions: {
                    type: 'quotep',
                    placeholder: 'Zitat'
                  },
                  rules: [
                    br,
                    link
                  ]
                },
                {
                  matchMdast: (node, index, parent) => matchParagraph(node) && matchLast(node, index, parent),
                  component: PullQuoteSource,
                  editorModule: 'paragraph',
                  editorOptions: {
                    type: 'quotecite',
                    placeholder: 'Quellenangabe / Autor'
                  },
                  rules: [
                    br,
                    link
                  ]
                }
              ]
            }
          ]
        },
      ]
    }
  ]
}

export default schema
