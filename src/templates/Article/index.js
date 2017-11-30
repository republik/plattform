import React from 'react'

import Container, { withMeta } from './Container'
import Center from '../../components/Center'
import TitleBlock from '../../components/TitleBlock'
import * as Editorial from '../../components/Typography/Editorial'
import * as Interaction from '../../components/Typography/Interaction'
import { TeaserFeed } from '../../components/TeaserFeed'

import {
  Figure,
  FigureImage,
  FigureCaption,
  FigureByline,
  FigureGroup
} from '../../components/Figure'
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
  Tweet
} from '../../components/Social'

import {
  matchType,
  matchZone,
  matchHeading,
  matchParagraph,
  matchImageParagraph
} from 'mdast-react-render/lib/utils'

const matchLast = (node, index, parent) => index === parent.children.length - 1

const link = {
  matchMdast: matchType('link'),
  props: node => ({
    title: node.title,
    href: node.url
  }),
  component: Editorial.A,
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
      component: Editorial.Emphasis,
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
    size: node.data.size
  }),
  editorModule: 'figure',
  editorOptions: {
    afterType: 'PARAGRAPH',
    pixelNote: 'Auflösung: min. 1200x, für E2E min. 2000x (proportionaler Schnitt)',
    insertButtonText: 'Bild',
    sizes: [
      {
        label: 'Edge to Edge',
        props: {size: undefined},
        parent: {kinds: ['document', 'block'], types: ['CENTER']},
        unwrap: true
      },
      {
        label: 'Gross',
        props: {size: 'breakout'},
        parent: {kinds: ['document', 'block'], types: ['CENTER']},
        wrap: 'CENTER'
      },
      {
        label: 'Normal',
        props: {size: undefined},
        parent: {kinds: ['document', 'block'], types: ['CENTER']},
        wrap: 'CENTER'
      }
    ]
  },
  rules: [
    {
      matchMdast: matchImageParagraph,
      component: FigureImage,
      props: node => ({
        src: node.children[0].url,
        alt: node.children[0].alt
      }),
      editorModule: 'figureImage',
      isVoid: true
    },
    figureCaption
  ]
}

const cover = {
  matchMdast: (node, index) => (
    matchZone('FIGURE')(node) &&
    index === 0
  ),
  component: Figure,
  props: node => ({
    size: node.data.size
  }),
  editorModule: 'figure',
  editorOptions: {
    type: 'COVERFIGURE',
    afterType: 'PARAGRAPH',
    pixelNote: 'Auflösung: min. 2000x (proportionaler Schnitt)',
    sizes: [
      {
        label: 'Edge to Edge',
        props: {size: undefined}
      },
      {
        label: 'Zentriert',
        props: {size: 'center'}
      }
    ]
  },
  rules: [
    {
      matchMdast: matchImageParagraph,
      component: FigureImage,
      props: node => ({
        src: node.children[0].url,
        alt: node.children[0].alt
      }),
      editorModule: 'figureImage',
      isVoid: true
    },
    figureCaption
  ]
}

const createSchema = ({
  documentEditorOptions = {},
  titleBlockAppend = null,
  repoPrefix = 'article-'
} = {}) => ({
  repoPrefix,
  rules: [
    {
      matchMdast: matchType('root'),
      component: Container,
      props: node => ({
        meta: node.meta
      }),
      editorModule: 'documentPlain',
      editorOptions: documentEditorOptions,
      rules: [
        {
          matchMdast: () => false,
          editorModule: 'meta',
          editorOptions: {
            customFields: [
              {
                label: 'Ebene',
                key: 'kind',
                items: [
                  {value: 'editorial', text: 'Editorial'},
                  {value: 'meta', text: 'Meta'},
                  {value: 'metaSocial', text: 'Social Meta'},
                  {value: 'editorialSocial', text: 'Social Editorial'}
                ]
              },
              {
                label: 'Format',
                key: 'format'
              }
            ],
            teaser: props => (
              <div style={{backgroundColor: '#fff', padding: '30px 30px 1px'}}>
                <TeaserFeed {...props} />
              </div>
            )
          }
        },
        cover,
        {
          matchMdast: matchZone('TITLE'),
          component: ({children, ...props}) => (
            <TitleBlock {...props}>
              {children}
              {titleBlockAppend}
            </TitleBlock>
          ),
          props: (node, index, parent) => ({
            center: node.data.center
          }),
          editorModule: 'title',
          editorOptions: {
            coverType: cover.editorOptions.type
          },
          rules: [
            {
              matchMdast: matchHeading(1),
              component: withMeta(({ children, attributes, meta }) => {
                const Headline = meta.kind && meta.kind.indexOf('meta') !== -1
                  ? Interaction.Headline
                  : Editorial.Headline
                return <Headline attributes={attributes}>{children}</Headline>
              }),
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
                columns: node.data.columns
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
                size: node.data.size,
                figureSize: node.children.find(matchZone('FIGURE'))
                  ? node.data.figureSize || 'S'
                  : undefined,
                figureFloat: node.data.figureFloat
              }),
              editorModule: 'infobox',
              editorOptions: {
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
                figure,
                {
                  matchMdast: matchParagraph,
                  component: InfoBoxText,
                  editorModule: 'paragraph',
                  editorOptions: {
                    type: 'INFOP',
                    placeholder: 'Infotext'
                  },
                  rules: paragraph.rules
                }
              ]
            },
            {
              matchMdast: matchZone('QUOTE'),
              component: PullQuote,
              props: node => ({
                size: node.data.size,
                hasFigure: !!node.children.find(matchZone('FIGURE'))
              }),
              editorModule: 'quote',
              editorOptions: {
                insertButtonText: 'Zitat'
              },
              rules: [
                figure,
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
            },
            {
              matchMdast: matchZone('EMBEDTWITTER'),
              component: ({data, url}) => (
                <Tweet {...data} date={new Date(data.createdAt)} />
              ),
              props: node => ({
                data: {
                  ...node.data,
                  url: node.children[0].children[0].url
                }
              }),
              editorModule: 'embedTwitter',
              editorOptions: {
                lookupType: 'PARAGRAPH'
              },
              isVoid: true
            },
          ]
        },
        {
          editorModule: 'specialchars'
        }
      ]
    }
  ]
})

export default createSchema
