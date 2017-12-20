import React from 'react'
import { css } from 'glamor'

import Container, { withMeta } from './Container'
import Center, { Breakout } from '../../components/Center'
import TitleBlock from '../../components/TitleBlock'
import * as Editorial from '../../components/Typography/Editorial'
import * as Interaction from '../../components/Typography/Interaction'
import { Sub, Sup } from '../../components/Typography'
import { TeaserFeed } from '../../components/TeaserFeed'

import {
  Figure,
  FigureImage,
  FigureCaption,
  FigureByline,
  FigureGroup,
  FIGURE_SIZES
} from '../../components/Figure'
import {
  PullQuote,
  PullQuoteText,
  PullQuoteSource
} from '../../components/PullQuote'
import {
  List,
  ListItem
} from '../../components/List'
import {
  InfoBox,
  InfoBoxTitle,
  InfoBoxText,
  INFOBOX_DEFAULT_IMAGE_SIZE
} from '../../components/InfoBox'
import {
  Tweet
} from '../../components/Social'
import {
  Video
} from '../../components/Video'
import {
  VideoPlayer
} from '../../components/VideoPlayer'
import {
  DossierTag,
  DossierSubheader,
  DossierTile,
  DossierTileHeadline,
  DossierTileRow
} from '../../components/Dossier'
import {
  TeaserFrontLead,
  TeaserFrontCredit,
  TeaserFrontCreditLink
} from '../../components/TeaserFront'
import {
  matchType,
  matchZone,
  matchHeading,
  matchParagraph,
  matchImageParagraph
} from 'mdast-react-render/lib/utils'
import {
  matchInfoBox,
  matchQuote,
  matchFigure,
  getDisplayWidth
} from './utils'

const matchLast = (node, index, parent) => index === parent.children.length - 1
const matchTeaser = matchZone('TEASER')
const matchTeaserType = teaserType =>
  node => matchTeaser(node) && node.data.teaserType === teaserType

const image = {
  matchMdast: matchImageParagraph,
  component: () => null,
  isVoid: true
}

const extractImage = node => matchImageParagraph(node)
  ? node.children[0].url
  : undefined

const link = {
  matchMdast: matchType('link'),
  props: node => ({
    title: node.title,
    href: node.url
  }),
  component: Editorial.A,
  editorModule: 'link'
}

const styles = {
  link: css({
    color: 'inherit',
    textDecoration: 'none'
  })
}

const globalInlines = [
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
  },
  {
    matchMdast: matchType('break'),
    component: () => <br />,
    isVoid: true
  }
]

const paragraph = {
  matchMdast: matchParagraph,
  component: Editorial.P,
  editorModule: 'paragraph',
  editorOptions: {
    formatButtonText: 'Paragraph'
  },
  rules: [
    ...globalInlines,
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
  editorModule: 'figurecaption',
  editorOptions: {
    afterType: 'PARAGRAPH',
    insertAfterType: 'FIGURE',
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
    ...globalInlines
  ]
}

const figure = {
  matchMdast: matchFigure,
  component: Figure,
  props: node => ({
    size: node.data.size
  }),
  editorModule: 'figure',
  editorOptions: {
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
      props: (node, index, parent, { ancestors }) => {
        const src = node.children[0].url
        const displayWidth = getDisplayWidth(ancestors)

        return {
          ...FigureImage.utils.getResizedSrcs(
            src,
            displayWidth
          ),
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
  matchMdast: (node, index) => (
    matchFigure(node) &&
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
      props: (node, index, parent) => {
        const src = node.children[0].url
        const displayWidth = FIGURE_SIZES[parent.data.size] || 1500

        return {
          ...FigureImage.utils.getResizedSrcs(
            src,
            displayWidth
          ),
          alt: node.children[0].alt
        }
      },
      editorModule: 'figureImage',
      isVoid: true
    },
    figureCaption
  ]
}

const DefaultLink = ({ children }) => children

const createSchema = ({
  documentEditorOptions = {},
  titleBlockAppend = null,
  repoPrefix = 'article-',
  Link = DefaultLink
} = {}) => {
  const teaserTitle = (type, Headline) => ({
    matchMdast: matchHeading(1),
    component: ({ children, href, ...props }) =>
      <Link href={href} passHref>
        <a {...styles.link} href={href}>
          <Headline {...props}>{children}</Headline>
        </a>
      </Link>,
    props (node, index, parent, { ancestors }) {
      const teaser = ancestors.find(matchTeaser)
      return {
        kind: parent.data.kind,
        titleSize: parent.data.titleSize,
        href: teaser
          ? teaser.data.url
          : undefined
      }
    },
    editorModule: 'headline',
    editorOptions: {
      type,
      placeholder: 'Titel',
      depth: 1
    },
    rules: globalInlines
  })

  const teaserLead = {
    matchMdast: matchHeading(4),
    component: ({ children, attributes }) =>
      <TeaserFrontLead attributes={attributes}>
        {children}
      </TeaserFrontLead>,
    editorModule: 'headline',
    editorOptions: {
      type: 'FRONTLEAD',
      placeholder: 'Lead',
      depth: 4,
      optional: true
    },
    rules: globalInlines
  }

  const teaserFormat = {
    matchMdast: matchHeading(6),
    component: ({ children, attributes }) =>
      <Editorial.Format attributes={attributes}>
        {children}
      </Editorial.Format>,
    editorModule: 'headline',
    editorOptions: {
      type: 'FRONTFORMAT',
      placeholder: 'Format',
      depth: 6,
      optional: true
    },
    rules: globalInlines
  }

  const teaserCredit = {
    matchMdast: matchParagraph,
    component: ({ children, attributes }) =>
      <TeaserFrontCredit attributes={attributes}>
        {children}
      </TeaserFrontCredit>,
    editorModule: 'paragraph',
    editorOptions: {
      type: 'FRONTCREDIT',
      placeholder: 'Credit'
    },
    rules: [
      ...globalInlines,
      {
        matchMdast: matchType('link'),
        props: (node) => {
          return {
            title: node.title,
            href: node.url
          }
        },
        component: ({ children, data, ...props }) =>
          <Link href={props.href} passHref>
            <TeaserFrontCreditLink {...props}>
              {children}
            </TeaserFrontCreditLink>
          </Link>,
        editorModule: 'link',
        editorOptions: {
          type: 'FRONTLINK'
        }
      }
    ]
  }

  const dossierTile = {
    matchMdast: matchTeaserType('dossierTile'),
    component: ({ children, attributes, ...props }) => (
      <Link href={props.url}>
        <DossierTile attributes={attributes} {...props}>
          {children}
        </DossierTile>
      </Link>
    ),
    props: node => ({
      image: extractImage(node.children[0]),
      ...node.data
    }),
    editorModule: 'teaser',
    editorOptions: {
      type: 'DOSSIERTILE',
      teaserType: 'dossierTile',
      insertButton: 'Dossier Tile',
      dnd: false,
      formOptions: [
        'showImage',
        'image',
        'kind'
      ]
    },
    rules: [
      image,
      teaserTitle(
        'DOSSIERTILETITLE',
        ({ children, attributes, kind }) => {
          const Component = kind === 'editorial'
          ? DossierTileHeadline.Editorial
          : DossierTileHeadline.Interaction
          return (
            <Component attributes={attributes}>
              {children}
            </Component>
          )
        }
      ),
      teaserLead,
      teaserFormat,
      teaserCredit
    ]
  }

  const dossierTileRow = {
    matchMdast: node => {
      return matchZone('TEASERGROUP')(node)
    },
    component: ({ children, attributes, ...props }) => {
      return <DossierTileRow attributes={attributes} {...props}>
        {children}
      </DossierTileRow>
    },
    editorModule: 'teasergroup',
    editorOptions: {
      type: 'DOSSIERTILEROW',
      insertButton: 'Dossier Tile Row'
    },
    rules: [
      dossierTile
    ]
  }

  const dossierBlock = {
    matchMdast: node => {
      return matchZone('DOSSIERBLOCK')(node)
    },
    component: ({ children, attributes, ...props }) => {
      return <Breakout size='breakout' attributes={attributes} {...props}>
        {children}
      </Breakout>
    },
    editorModule: 'dossierblock',
    editorOptions: {
      type: 'DOSSIERBLOCK',
      insertButton: 'Dossier Block'
    },
    rules: [
      {
        matchMdast: matchHeading(2),
        component: ({ children, attributes }) => (
          <DossierSubheader attributes={attributes}>
            {children}
          </DossierSubheader>
        ),
        editorModule: 'headline',
        editorOptions: {
          type: 'DOSSIERSUBHEADER',
          placeholder: 'Dossier',
          depth: 2
        }
      },
      dossierTileRow
    ]
  }

  return {
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
            component: withMeta(({children, meta, ...props}) => (
              <TitleBlock {...props} kind={meta.kind} format={meta.format}>
                {children}
                {titleBlockAppend}
              </TitleBlock>
            )),
            props: (node, index, parent) => ({
              center: node.data.center
            }),
            editorModule: 'title',
            editorOptions: {
              coverType: cover.editorOptions.type
            },
            rules: [
              {
                matchMdast: matchHeading(6),
                component: ({ children, attributes }) => (
                  <DossierTag attributes={attributes}>{children}</DossierTag>
                ),
                editorModule: 'headline',
                editorOptions: {
                  type: 'DOSSIERTAG',
                  placeholder: 'Dossier',
                  depth: 1
                }
              },
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
                matchMdast: (node, index, parent) => {
                  const numHeadings = parent.children.filter(
                    child => child.type === 'heading').length
                  return matchParagraph(node) && index === numHeadings
                },
                component: Editorial.Lead,
                editorModule: 'paragraph',
                editorOptions: {
                  type: 'LEAD',
                  placeholder: 'Lead'
                },
                rules: [
                  ...globalInlines,
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
                  ...globalInlines,
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
                ],
                editorModule: 'figuregroup',
                editorOptions: {
                  insertButtonText: 'Bildergruppe'
                }
              },
              {
                matchMdast: matchInfoBox,
                component: InfoBox,
                props: node => ({
                  size: node.data.size,
                  figureSize: node.children.find(matchZone('FIGURE'))
                    ? node.data.figureSize || INFOBOX_DEFAULT_IMAGE_SIZE
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
                matchMdast: matchQuote,
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
                      ...globalInlines,
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
                      ...globalInlines,
                      link
                    ]
                  }
                ]
              },
              {
                matchMdast: matchType('list'),
                component: List,
                props: node => ({
                  data: {
                    ordered: node.ordered,
                    start: node.start,
                    compact: !node.loose
                  }
                }),
                editorModule: 'list',
                rules: [
                  {
                    matchMdast: matchType('listItem'),
                    component: ListItem,
                    editorModule: 'listItem',
                    rules: [paragraph]
                  }
                ]
              },
              {
                matchMdast: matchZone('EMBEDTWITTER'),
                component: ({attributes, data, url}) => (
                  <Tweet attributes={attributes} {...data} date={new Date(data.createdAt)} />
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
              {
                matchMdast: matchZone('EMBEDVIDEO'),
                component: ({attributes, data, url}) => {
                  if (data.src) {
                    return <VideoPlayer attributes={attributes} {...data} />
                  }
                  return (
                    <Video attributes={attributes} {...data} date={new Date(data.createdAt)} />
                  )
                },
                props: node => ({
                  data: {
                    ...node.data,
                    url: node.children[0].children[0].url
                  }
                }),
                editorModule: 'embedVideo',
                editorOptions: {
                  lookupType: 'PARAGRAPH',
                  sizes: [
                    {
                      label: 'Normal',
                      props: {size: undefined}
                    },
                    {
                      label: 'Mittel',
                      props: {size: 'narrow'}
                    },
                    {
                      label: 'Klein',
                      props: {size: 'tiny'}
                    }
                  ]
                },
                isVoid: true
              },
              dossierBlock,
            ]
          },
          {
            editorModule: 'specialchars'
          }
        ]
      }
    ]
  }
}

export default createSchema
