import React from 'react'

import Container from './Container'
import Center from '../../components/Center'
import {
  BlockQuote,
  BlockQuoteParagraph
} from '../../components/BlockQuote'
import TitleBlock from '../../components/TitleBlock'
import { HR } from '../../components/Typography'
import * as Editorial from '../../components/Typography/Editorial'
import * as Interaction from '../../components/Typography/Interaction'
import { TeaserFeed } from '../../components/TeaserFeed'
import IllustrationHtml from '../../components/IllustrationHtml'
import CsvChart from '../../components/Chart/Csv'
import { ChartTitle, ChartLead } from '../../components/Chart'
import ErrorBoundary from '../../components/ErrorBoundary'

import {
  Figure,
  FigureCover,
  FigureImage,
  FigureCaption,
  FigureByline,
  FigureGroup,
  FIGURE_SIZES,
  CoverTextTitleBlockHeadline
} from '../../components/Figure'
import {
  PullQuote,
  PullQuoteText,
  PullQuoteSource
} from '../../components/PullQuote'
import { List, ListItem } from '../../components/List'
import {
  InfoBox,
  InfoBoxTitle,
  InfoBoxText,
  INFOBOX_DEFAULT_IMAGE_SIZE
} from '../../components/InfoBox'
import { Tweet } from '../../components/Social'
import { Video } from '../../components/Video'
import { VideoPlayer } from '../../components/VideoPlayer'
import { AudioPlayer } from '../../components/AudioPlayer'

import {
  matchType,
  matchZone,
  matchHeading,
  matchParagraph,
  matchImage,
  matchImageParagraph
} from 'mdast-react-render/lib/utils'
import {
  matchLast,
  matchInfoBox,
  matchQuote,
  matchFigure,
  getDisplayWidth,
  extractImage,
  globalInlines,
  styles,
  getDatePath
} from './utils'

import createTeasers from './teasers'

const link = {
  matchMdast: matchType('link'),

  props: node => ({
    title: node.title,
    href: node.url
  }),
  component: Editorial.A,
  editorModule: 'link'
}

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
        type: 'STRONG',
        mdastType: 'strong'
      }
    },
    {
      matchMdast: matchType('emphasis'),
      component: Editorial.Cursive,
      editorModule: 'mark',
      editorOptions: {
        type: 'EMPHASIS',
        mdastType: 'emphasis'
      }
    },
    link
  ]
}

const figureImage = {
  matchMdast: matchImageParagraph,
  component: FigureImage,
  props: (node, index, parent, { ancestors }) => {
    const src = extractImage(node)
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
}

const figureByLine = {
  matchMdast: matchType('emphasis'),
  component: FigureByline,
  editorModule: 'paragraph',
  editorOptions: {
    type: 'BYLINE',
    placeholder: 'Credit'
  }
}

const figureCaption = {
  matchMdast: matchParagraph,
  component: FigureCaption,
  editorModule: 'figureCaption',
  editorOptions: {
    isStatic: true,
    placeholder: 'Legende'
  },
  rules: [
    figureByLine,
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
    pixelNote:
      'Auflösung: min. 1200x, für E2E min. 2000x (proportionaler Schnitt)',
    sizes: [
      {
        label: 'Edge to Edge',
        props: { size: undefined },
        parent: {
          kinds: ['document', 'block'],
          types: ['CENTER']
        },
        unwrap: true
      },
      {
        label: 'Gross',
        props: { size: 'breakout' },
        parent: {
          kinds: ['document', 'block'],
          types: ['CENTER']
        },
        wrap: 'CENTER'
      },
      {
        label: 'Normal',
        props: { size: undefined },
        parent: {
          kinds: ['document', 'block'],
          types: ['CENTER']
        },
        wrap: 'CENTER'
      }
    ]
  },
  rules: [
    figureImage,
    figureCaption
  ]
}

const centerFigureCaption = {
  ...figureCaption,
  editorOptions: {
    ...figureCaption.editorOptions,
    type: 'CENTERFIGURECAPTION',
    afterType: 'PARAGRAPH',
    insertAfterType: 'CENTER'
  },
  rules: [
    {
      ...figureByLine,
      editorOptions: {
        ...figureByLine.editorOptions,
        type: 'CENTERBYLINE'
      }
    },
    link,
    ...globalInlines
  ]
}

const centerFigure = {
  ...figure,
  editorOptions: {
    ...figure.editorOptions,
    insertButtonText: 'Bild',
    insertTypes: [
      'PARAGRAPH'
    ],
    type: 'CENTERFIGURE'
  },
  rules: [
    figureImage,
    centerFigureCaption
  ]
}

const interactionParagraphRules = [
  ...globalInlines,
  {
    matchMdast: matchType('strong'),
    component: Interaction.Emphasis,
    editorModule: 'mark',
    editorOptions: {
      type: 'STRONG', // ToDo: Change to INTERACTIONSTRONG (pending contextual editor UI)
      mdastType: 'strong'
    }
  },
  {
    matchMdast: matchType('emphasis'),
    component: Interaction.Cursive,
    editorModule: 'mark',
    editorOptions: {
      type: 'EMPHASIS', // ToDo: Change to INTERACTIONEMPHASIS (pending contextual editor UI)
      mdastType: 'emphasis'
    }
  },
  link
]

const infoBox = {
  matchMdast: matchInfoBox,
  component: InfoBox,
  props: node => ({
    size: node.data.size,
    figureSize: node.children.find(
      matchFigure
    )
      ? node.data.figureSize ||
        INFOBOX_DEFAULT_IMAGE_SIZE
      : undefined,
    figureFloat: node.data.figureFloat
  }),
  editorModule: 'infobox',
  editorOptions: {
    insertButtonText: 'Infobox',
    insertTypes: [
      'PARAGRAPH'
    ]
  },
  rules: [
    {
      matchMdast: matchHeading(3),
      component: InfoBoxTitle,
      editorModule: 'headline',
      editorOptions: {
        type: 'INFOH',
        depth: 3,
        placeholder: 'Title',
        isStatic: true
      }
    },
    {
      ...figure,
      editorOptions: {
        ...figure.editorOptions,
        type: 'INFOFIGURE'
      },
      rules: [
        figureImage,
        {
          ...figureCaption,
          editorOptions: {
            type: 'INFOFIGURECAPTION',
            placeholder: 'Legende',
            isStatic: true
          }
        }
      ]
    },
    {
      matchMdast: matchParagraph,
      component: InfoBoxText,
      editorModule: 'paragraph',
      editorOptions: {
        type: 'INFOP',
        placeholder: 'Infotext',
        isStatic: true,
        afterType: 'PARAGRAPH',
        insertAfterType: 'CENTER'
      },
      rules: interactionParagraphRules
    }
  ]
}

const blockQuote = {
  matchMdast: matchZone('BLOCKQUOTE'),
  props: node => {
    return ({
      isEmpty: node.children &&
      node.children.length === 1 && !node.children[0].children
    })
  },
  component: ({ isEmpty, node, children, attributes }) => (
    isEmpty ? null : <BlockQuote attributes={attributes}>{children}</BlockQuote>
  ),
  editorModule: 'blockquote',
  editorOptions: {
    insertButtonText: 'Block-Zitat'
  },
  rules: [
    {
      matchMdast: matchType('blockquote'),
      component: BlockQuoteParagraph,
      editorModule: 'paragraph',
      editorOptions: {
        type: 'BLOCKQUOTEPARAGRAPH',
        placeholder: 'Zitat-Absatz'
      },
      rules: [
        {
          matchMdast: matchParagraph,
          component: ({ children }) => children
        }
      ]
    },
    figureCaption
  ]
}

const pullQuote = {
  matchMdast: matchQuote,
  component: PullQuote,
  props: node => ({
    size: node.data.size,
    hasFigure: !!node.children.find(
      matchFigure
    )
  }),
  editorModule: 'quote',
  editorOptions: {
    insertButtonText: 'Zitat',
    insertTypes: [
      'PARAGRAPH'
    ]
  },
  rules: [
    figure,
    {
      matchMdast: (node, index, parent) =>
        matchParagraph(node) &&
        (
          index === 0 ||
          (index === 1 && matchFigure(parent.children[0])) ||
          !matchLast(node, index, parent)
        ),
      component: PullQuoteText,
      editorModule: 'paragraph',
      editorOptions: {
        type: 'QUOTEP',
        placeholder: 'Zitat'
      },
      rules: [...globalInlines, link]
    },
    {
      matchMdast: (node, index, parent) =>
        matchParagraph(node) &&
        matchLast(node, index, parent),
      component: PullQuoteSource,
      editorModule: 'paragraph',
      editorOptions: {
        type: 'QUOTECITE',
        placeholder: 'Quellenangabe / Autor',
        isStatic: true,
        afterType: 'PARAGRAPH',
        insertAfterType: 'CENTER'
      },
      rules: [...globalInlines, link]
    }
  ]
}

export const COVER_TYPE = 'COVERFIGURE'

const mdastToString = node => node
  ? (
    node.value ||
    (node.children && node.children.map(mdastToString).join('')) ||
    ''
  )
  : ''

const cover = {
  matchMdast: (node, index) => (
    matchFigure(node) &&
    index === 0
  ),
  component: FigureCover,
  props: (node, index, parent, { ancestors }) => {
    let text
    const rootNode = ancestors[ancestors.length - 1]
    const meta = rootNode.meta
    const headline = ((
      rootNode.children.find(matchZone('TITLE')) || {}
    ).children || []).find(matchHeading(1))

    if (meta.coverText && headline) {
      const Headline = (
        rootNode.format && rootNode.format.meta && rootNode.format.meta.kind === 'meta'
      )
        ? Interaction.Headline
        : Editorial.Headline
      const element = <Headline style={{
        color: meta.coverText.color,
        fontSize: meta.coverText.fontSize,
        lineHeight: meta.coverText.lineHeight || 1.03
      }}>
        {mdastToString(headline)}
      </Headline>

      text = {
        element,
        anchor: meta.coverText.anchor,
        offset: meta.coverText.offset
      }
    }
    return {
      size: node.data.size,
      text
    }
  },
  editorModule: 'figure',
  editorOptions: {
    type: COVER_TYPE,
    afterType: 'PARAGRAPH',
    insertAfterType: 'CENTER',
    pixelNote:
      'Auflösung: min. 2000x (proportionaler Schnitt)',
    sizes: [
      {
        label: 'Edge to Edge',
        props: { size: undefined }
      },
      {
        label: 'Zentriert',
        props: {size: 'center'}
      },
      {
        label: 'Klein',
        props: {size: 'tiny'}
      }
    ]
  },
  rules: [
    {
      matchMdast: matchImageParagraph,
      component: FigureImage,
      props: (node, index, parent) => {
        const src = extractImage(node)
        const displayWidth =
          FIGURE_SIZES[parent.data.size] || 1500
        const setMaxWidth = parent.data.size !== undefined

        return {
          ...FigureImage.utils.getResizedSrcs(
            src,
            displayWidth,
            setMaxWidth
          ),
          aboveTheFold: true,
          alt: node.children[0].alt
        }
      },
      editorModule: 'figureImage',
      isVoid: true
    },
    figureCaption
  ]
}

const mdastPlaceholder = '\u2063'
const DefaultLink = ({ children }) => children

const createSchema = ({
  documentEditorOptions = {},
  customMetaFields = [
    {
      label: 'Format',
      key: 'format',
      ref: 'repo'
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
    }
  ],
  titleBlockRule,
  titleBlockPrepend = null,
  titleBlockAppend = null,
  repoPrefix = 'article-',
  series = true,
  Link = DefaultLink,
  getPath = getDatePath,
  t = () => ''
} = {}) => {
  const teasers = createTeasers({
    t,
    Link
  })

  return {
    repoPrefix,
    getPath,
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
              series,
              customFields: customMetaFields,
              teaser: props => (
                <div
                  style={{
                    backgroundColor: '#fff',
                    padding: '30px 30px 1px'
                  }}
                >
                  <TeaserFeed {...props} />
                </div>
              )
            }
          },
          cover,
          titleBlockRule || {
            matchMdast: matchZone('TITLE'),
            component: ({children, format, ...props}) => (
              <TitleBlock {...props} format={format} Link={Link}>
                {titleBlockPrepend}
                {format && format.meta && (
                  <Editorial.Format color={format.meta.color} contentEditable={false}>
                    <Link href={format.meta.path} passHref>
                      <a {...styles.link} href={format.meta.path}>
                        {format.meta.title}
                      </a>
                    </Link>
                  </Editorial.Format>
                )}
                {children}
                {titleBlockAppend}
              </TitleBlock>
            ),
            props: (node, index, parent, { ancestors }) => ({
              center: node.data.center,
              format: ancestors[ancestors.length - 1].format
            }),
            editorModule: 'title',
            editorOptions: {
              coverType: COVER_TYPE
            },
            rules: [
              {
                matchMdast: matchHeading(1),
                component: ({ children, attributes, format, coverText }) => {
                  const Headline = (
                    format && format.meta && format.meta.kind === 'meta'
                  )
                    ? Interaction.Headline
                    : Editorial.Headline

                  const element = <Headline attributes={attributes}>{children}</Headline>

                  if (coverText) {
                    return <CoverTextTitleBlockHeadline>{element}</CoverTextTitleBlockHeadline>
                  }

                  return element
                },
                props: (node, index, parent, { ancestors }) => {
                  const rootNode = ancestors[ancestors.length - 1]
                  return {
                    format: rootNode.format,
                    coverText: rootNode.meta.coverText
                  }
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
                matchMdast: (node, index, parent) => {
                  const numHeadings = parent.children.filter(
                    child => child.type === 'heading'
                  ).length
                  return (
                    matchParagraph(node) &&
                    index === numHeadings
                  )
                },
                component: ({children, ...props}) => {
                  if (
                    children &&
                    children.length === 1 &&
                    children[0] === mdastPlaceholder
                  ) {
                    return null
                  }
                  return <Editorial.Lead children={children} {...props} />
                },
                editorModule: 'paragraph',
                editorOptions: {
                  type: 'LEAD',
                  placeholder: 'Lead',
                  mdastPlaceholder,
                  isStatic: true
                },
                rules: [...globalInlines, link]
              },
              {
                matchMdast: matchParagraph,
                component: Editorial.Credit,
                editorModule: 'paragraph',
                editorOptions: {
                  type: 'CREDIT',
                  placeholder: 'Autoren, Datum',
                  isStatic: true,
                  afterType: 'PARAGRAPH',
                  insertAfterType: 'CENTER'
                },
                rules: [...globalInlines, link]
              }
            ]
          },
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
                },
                rules: globalInlines
              },
              {
                matchMdast: matchZone('FIGUREGROUP'),
                component: FigureGroup,
                props: node => ({
                  size: 'breakout',
                  columns: node.data.columns
                }),
                rules: [figure, centerFigureCaption],
                editorModule: 'figuregroup',
                editorOptions: {
                  insertButtonText: 'Bildergruppe',
                  insertTypes: [
                    'PARAGRAPH'
                  ]
                }
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
                matchMdast: matchType('thematicBreak'),
                component: HR,
                editorModule: 'line',
                editorOptions: {
                  insertButtonText: 'Trennlinie',
                  insertTypes: [
                    'PARAGRAPH'
                  ]
                },
                isVoid: true
              },
              {
                matchMdast: matchZone('EMBEDTWITTER'),
                component: ({ attributes, data, url }) => (
                  <Tweet
                    attributes={attributes}
                    {...data}
                    date={new Date(data.createdAt)}
                  />
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
                component: ({ attributes, data, url }) => {
                  if (data.forceAudio && data.src) {
                    return (
                      <AudioPlayer
                        attributes={attributes}
                        {...data}
                        t={t}
                      />
                    )
                  }
                  if (data.src) {
                    return (
                      <VideoPlayer
                        attributes={attributes}
                        {...data}
                        t={t}
                      />
                    )
                  }
                  return (
                    <Video
                      attributes={attributes}
                      {...data}
                      t={t}
                      date={new Date(data.createdAt)}
                    />
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
                      props: { size: undefined }
                    },
                    {
                      label: 'Gross',
                      props: { size: 'breakout' }
                    },
                    {
                      label: 'Mittel',
                      props: { size: 'narrow' }
                    },
                    {
                      label: 'Klein',
                      props: { size: 'tiny' }
                    }
                  ]
                },
                isVoid: true
              },
              infoBox,
              pullQuote,
              paragraph,
              {
                matchMdast: matchZone('NOTE'),
                component: ({ children }) => children,
                editorModule: 'blocktext',
                editorOptions: {
                  mdastType: 'zone',
                  identifier: 'NOTE',
                  formatButtonText: 'Notiz',
                  isStatic: true
                },
                rules: [
                  {
                    matchMdast: matchParagraph,
                    component: Editorial.Note,
                    editorModule: 'paragraph',
                    editorOptions: {
                      type: 'NOTEP',
                      placeholder: 'Anmerkung',
                      isStatic: true,
                      afterType: 'PARAGRAPH',
                      insertAfterType: 'CENTER'
                    },
                    rules: interactionParagraphRules
                  }
                ]
              },
              {
                matchMdast: matchZone('CHART'),
                component: Figure,
                props: node => ({
                  size: node.data.size
                }),
                editorModule: 'chart',
                editorOptions: {
                  insertButtonText: 'Chart',
                  insertTypes: [
                    'PARAGRAPH'
                  ]
                },
                rules: [
                  {
                    matchMdast: matchHeading(3),
                    component: ChartTitle,
                    editorModule: 'headline',
                    editorOptions: {
                      type: 'CHARTTITLE',
                      placeholder: 'Titel',
                      depth: 3,
                      isStatic: true
                    },
                    rules: globalInlines
                  },
                  {
                    matchMdast: (node, index, parent) =>
                      matchParagraph(node) && !matchLast(node, index, parent),
                    component: ChartLead,
                    editorModule: 'paragraph',
                    editorOptions: {
                      type: 'CHARTLEAD',
                      placeholder: 'Lead',
                      isStatic: true
                    },
                    rules: interactionParagraphRules
                  },
                  {
                    matchMdast: matchType('code'),
                    component: ({showException, ...props}) => (
                      <ErrorBoundary
                        showException={showException}
                        failureMessage={t('styleguide/charts/error')}>
                        <CsvChart {...props} />
                      </ErrorBoundary>
                    ),
                    props: (node, index, parent, { ancestors }) => {
                      const zone = ancestors.find(matchZone('CHART'))

                      return {
                        t,
                        config: zone.data,
                        values: node.value
                      }
                    },
                    editorModule: 'chartCanvas'
                  },
                  {
                    matchMdast: (node, index, parent) =>
                      matchParagraph(node) && matchLast(node, index, parent),
                    component: Editorial.Note,
                    props: () => ({
                      style: {marginTop: 10}
                    }),
                    editorModule: 'paragraph',
                    editorOptions: {
                      type: 'CHARTNOTE',
                      placeholder: 'Quelle',
                      isStatic: true,
                      afterType: 'PARAGRAPH',
                      insertAfterType: 'CENTER'
                    },
                    rules: interactionParagraphRules
                  }
                ]
              },
              centerFigure,
              teasers.articleCollection,
              blockQuote,
              {
                matchMdast: matchZone('HTML'),
                component: IllustrationHtml,
                props: node => {
                  const code = node.children.find(c => c.type === 'code')
                  const deepNodes = node.children.reduce(
                    (children, child) => children
                      .concat(child)
                      .concat(child.children),
                    []
                  ).filter(Boolean)
                  const images = deepNodes.filter(matchImage).map(image => ({
                    ref: image.alt,
                    url: image.url
                  }))
                  return {
                    code: code && code.value,
                    images
                  }
                },
                editorModule: 'html',
                editorOptions: {
                  insertTypes: [
                    'PARAGRAPH'
                  ],
                  insertButtonText: 'HTML Illustration'
                },
                isVoid: true
              }
            ]
          },
          centerFigure,
          {
            matchMdast: () => false,
            editorModule: 'specialchars'
          }
        ]
      }
    ]
  }
}

export default createSchema
