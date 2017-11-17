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
      editorModule: 'paragraph',
      editorOptions: {
        type: 'figureCaption',
        placeholder: 'Legende'
      },
      rules: [
        {
          matchMdast: matchType('emphasis'),
          component: FigureByline,
          editorModule: 'inline',
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
      editorModule: 'documentFlexible',
      rules: [
        {
          matchMdast: () => false,
          editorModule: 'meta'
        },
        {
          matchMdast: matchZone('TITLE'),
          component: TitleBlock,
          rules: [
            {
              matchMdast: matchHeading(1),
              component: Editorial.Headline
            },
            {
              matchMdast: (node, index) => matchParagraph(node) && index === 1,
              component: Editorial.Lead,
              rules: [
                br,
                link
              ]
            },
            {
              matchMdast: matchParagraph,
              component: Editorial.Credit,
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
              component: Editorial.Subhead
            },
            paragraph,
            figure,
            {
              matchMdast: matchZone('INFOBOX'),
              component: InfoBox,
              rules: [
                {
                  matchMdast: matchHeading(3),
                  component: InfoBoxTitle
                },
                {
                  matchMdast: matchParagraph,
                  component: InfoBoxText,
                  rules: paragraph.rules
                }
              ]
            },
            {
              matchMdast: matchZone('QUOTE'),
              component: PullQuote,
              rules: [
                {
                  matchMdast: (node, index, parent) => (
                    matchParagraph(node) &&
                    (index === 0 || !matchLast(node, index, parent))
                  ),
                  component: PullQuoteText,
                  rules: [
                    br,
                    link
                  ]
                },
                {
                  matchMdast: (node, index, parent) => matchParagraph(node) && matchLast(node, index, parent),
                  component: PullQuoteSource,
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
