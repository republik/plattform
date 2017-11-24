import React from 'react'

import Center from '../../components/Center'
import TitleBlock from '../../components/TitleBlock'
import * as Editorial from '../../components/Typography/Editorial'

import { Figure, FigureGroup } from '../../components/Figure'
import FigureImage from '../../components/Figure/Image'
import FigureCaption from '../../components/Figure/Caption'
import FigureByline from '../../components/Figure/Byline'

import {
  PullQuote,
  PullQuoteText,
  PullQuoteSource
} from '../../components/PullQuote'
import {
  InfoBox,
  InfoBoxTitle,
  InfoBoxText
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

const figureCaption = {
  matchMdast: matchParagraph,
  component: FigureCaption,
  // ToDo: replace with module that enforces a byline at the end
  editorModule: 'paragraph',
  editorOptions: {
    type: 'FIGURECAPTION',
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

const figure = {
  matchMdast: matchZone('FIGURE'),
  component: Figure,
  props: node => ({
    size: node.data.size // values: undefined, 'breakout'
  }),
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
    figureCaption
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
          props: node => ({
            center: node.data.center // undefined, false, true
          }),
          editorModule: 'block',
          editorOptions: {
            type: 'TITLE'
          },
          rules: [
            {
              matchMdast: matchHeading(1),
              component: Editorial.Headline,
              editorModule: 'headline',
              editorOptions: {
                type: 'H1',
                placeholder: 'Titel',
                depth: 1
              }
            },
            {
              matchMdast: (node, index) => matchParagraph(node) && index === 1,
              component: Editorial.Lead,
              editorModule: 'paragraph',
              editorOptions: {
                type: 'LEAD',
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
                type: 'CREDIT',
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
                type: 'H2',
                depth: 2,
                formatButtonText: 'Zwischentitel'
              }
            },
            paragraph,
            figure,
            {
              matchMdast: matchZone('FIGUREGROUP'),
              component: FigureGroup,
              props: node => ({
                size: 'breakout',
                columns: node.data.columns // values: 2, 3, 4
              }),
              rules: [
                figure,
                figureCaption
              ]
            },
            {
              matchMdast: matchZone('INFOBOX'),
              component: InfoBox,
              props: node => ({
                size: node.data.size, // values: undefined || 'regular', 'float', 'breakout'
                imageSize: node.data.imageSize, // values: 'XS', undefined || 'S', 'M', 'L'
                imageFloat: node.data.imageFloat // values: undefined, false, true
              }),
              editorModule: 'block',
              editorOptions: {
                type: 'INFOBOX',
                insertButtonText: 'Infobox'
              },
              rules: [
                {
                  matchMdast: matchHeading(3),
                  component: InfoBoxTitle,
                  editorModule: 'headline',
                  editorOptions: {
                    type: 'INFOH',
                    depth: 3,
                    placeholder: 'Title'
                  }
                },
                {
                  matchMdast: matchZone('FIGURE'),
                  component: Figure,
                  editorModule: 'figure',
                  editorOptions: {
                    type: 'INFOBOXFIGURE',
                    afterType: 'INFOP'
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
                      component: FigureByline,
                      editorModule: 'paragraph',
                      editorOptions: {
                        type: 'FIGURECAPTION',
                        placeholder: 'Credit'
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
                },
                {
                  matchMdast: matchParagraph,
                  component: InfoBoxText,
                  editorModule: 'paragraph',
                  editorOptions: {
                    type: 'INFOP',
                    placeholder: 'Text'
                  },
                  rules: paragraph.rules
                }
              ]
            },
            {
              matchMdast: matchZone('QUOTE'),
              component: PullQuote,
              props: node => ({
                size: node.data.size // values: undefined || 'regular', 'narrow', 'float', 'breakout'
              }),
              editorModule: 'block',
              editorOptions: {
                type: 'QUOTE',
                insertButtonText: 'Quote'
              },
              rules: [
                {
                  matchMdast: matchZone('FIGURE'),
                  component: Figure,
                  editorModule: 'figure',
                  editorOptions: {
                    type: 'QUOTEFIGURE',
                    afterType: 'QUOTEP'
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
                      component: FigureByline,
                      editorModule: 'paragraph',
                      editorOptions: {
                        type: 'FIGURECAPTION',
                        placeholder: 'Credit'
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
                },
                {
                  matchMdast: (node, index, parent) => (
                    matchParagraph(node) &&
                    (index === 0 || !matchLast(node, index, parent))
                  ),
                  component: PullQuoteText,
                  editorModule: 'paragraph',
                  editorOptions: {
                    type: 'QUOTEP',
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
                    type: 'QUOTECITE',
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
