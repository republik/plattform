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
import * as Scribble from '../../components/Typography/Scribble'
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
  InfoBoxListItem,
  InfoBoxSubhead,
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

import { slug } from '../../lib/slug'

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

import colors from '../../theme/colors'
import createTeasers from './teasers'
import createDynamicComponent from './dynamicComponent'

const link = {
  matchMdast: matchType('link'),
  props: node => ({
    title: node.title,
    href: node.url
  }),
  component: Editorial.A,
  editorModule: 'link',
  rules: globalInlines
}

const paragraphFormatting = [
  {
    matchMdast: matchType('strong'),
    component: ({attributes, children}) => <strong {...attributes}>{children}</strong>,
    editorModule: 'mark',
    editorOptions: {
      type: 'STRONG',
      mdastType: 'strong'
    }
  },
  {
    matchMdast: matchType('emphasis'),
    component: ({attributes, children}) => <em {...attributes}>{children}</em>,
    editorModule: 'mark',
    editorOptions: {
      type: 'EMPHASIS',
      mdastType: 'emphasis'
    }
  }
]
const paragraphRules = [
  ...globalInlines,
  ...paragraphFormatting,
  {
    ...link,
    rules: [
      ...globalInlines,
      ...paragraphFormatting
    ]
  }
]

const getProgressId = (node, index, parent, { ancestors }) => {
  if (parent.identifier === 'CENTER') {
    const rootNode = ancestors[ancestors.length - 1]
    const indexOfParent = rootNode && rootNode.children.length && rootNode.children.indexOf(parent)
    return indexOfParent + '-' + index
  }
  if (index > 0) {
    if (node.identifier === 'FIGURE' && ancestors.length === 1) {
      return index
    }
    if (node.identifier === 'DYNAMIC_COMPONENT' && ancestors.length === 1) {
      return index
    }
  }
}

const getProgressProps = (node, index, parent, { ancestors }) => {
  const progressId = getProgressId(node, index, parent, { ancestors })
  return progressId ? {
    attributes: {
      'data-pos': progressId
    }
  } : {}
}

const addProgressProps = rule => ({
  ...rule,
  props: rule.props
    ? (...args) => ({
      ...rule.props(...args),
      ...getProgressProps(...args)
    })
    : getProgressProps
})

const paragraph = {
  matchMdast: matchParagraph,
  component: Editorial.P,
  editorModule: 'paragraph',
  editorOptions: {
    formatButtonText: 'Paragraph'
  },
  props: getProgressProps,
  rules: paragraphRules
}

const list = {
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
}

const figureImage = {
  matchMdast: matchImageParagraph,
  component: FigureImage,
  props: (node, index, parent, { ancestors }) => {
    const src = extractImage(node)
    const displayWidth = getDisplayWidth(ancestors)
    const enableGallery = parent.data ? !parent.data.excludeFromGallery : true

    const group = ancestors.find(matchZone('FIGUREGROUP'))

    let gallerySize, aboveTheFold
    if (group && group.data.slideshow) {
      const {
        slideshow,
        columns
      } = group.data

      const index = group.children.indexOf(parent)
      const numFigs = group.children.filter(matchFigure).length

      const galleryCover =
        index === slideshow * columns - 1 &&
        numFigs > slideshow * columns

      gallerySize = galleryCover ? numFigs : undefined

      const hidden = index > slideshow * columns - 1
      // hidden images are wrapped in a noscript tag
      // setting aboveTheFold ensure that the figure
      // does not create a second noscript tag
      aboveTheFold = hidden || undefined
    }

    return {
      ...FigureImage.utils.getResizedSrcs(
        src,
        displayWidth,
      ),
      alt: node.children[0].alt,
      enableGallery,
      gallerySize,
      aboveTheFold
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
  component: ({hidden, ...rest}) => {
    const fig = <Figure {...rest} />
    if (hidden) {
      return <noscript>{fig}</noscript>
    } 
    return fig
  },
  props: (node, index, parent, { ancestors }) => {
    
    const group = ancestors.find(matchZone('FIGUREGROUP'))

    let hidden = false
    if (group && group.data.slideshow) {
      const { slideshow, columns } = group.data
      const index = group.children.indexOf(node)
      hidden = index > slideshow * columns - 1
    }

    return {
      hidden,
      size: node.data.size,
    }
  },
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

const createInfoBox = ({ t }) => ({
  matchMdast: matchInfoBox,
  component: InfoBox,
  props: (node, index, parent, { ancestors }) => ({
    t,
    size: node.data.size,
    collapsable: node.data.collapsable,
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
      props: node => ({
        slug: slug(mdastToString(node))
      }),
      component: ({ children, slug }) => <InfoBoxTitle>
        <a {...styles.anchor} id={slug} />
        {children}
      </InfoBoxTitle>,
      editorModule: 'headline',
      editorOptions: {
        type: 'INFOH',
        depth: 3,
        placeholder: 'Title',
        isStatic: true
      },
      rules: globalInlines
    },
    {
      matchMdast: matchHeading(4),
      component: InfoBoxSubhead,
      editorModule: 'headline',
      editorOptions: {
        placeholder: 'Zwischentitel',
        type: 'INFOH2',
        depth: 4,
        afterType: 'INFOP',
        insertAfterType: 'INFOBOX',
        formatButtonText: 'Infobox Zwischentitel',
        formatTypes: [
          'INFOP'
        ]
      },
      rules: globalInlines
    },
    {
      ...list,
      editorOptions: {
        ...list.editorOptions,
        type: 'INFOLIST',
        formatButtonText: 'Infobox Liste',
        formatButtonTextOrdered: 'Infobox Aufzählung',
        formatTypes: [
          'INFOP'
        ]
      },
      rules: [
        {
          matchMdast: matchType('listItem'),
          component: InfoBoxListItem,
          editorModule: 'listItem',
          editorOptions: {
            type: 'INFOLISTITEM'
          },
          rules: [
            {
              matchMdast: matchParagraph,
              component: InfoBoxText,
              editorModule: 'paragraph',
              editorOptions: {
                type: 'INFOP',
                placeholder: 'Infotext'
              },
              rules: paragraphRules
            }
          ]
        }
      ]
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
        placeholder: 'Infotext'
      },
      rules: paragraphRules
    }
  ]
})

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
      component: ({ children }) => children,
      editorModule: 'blocktext',
      editorOptions: {
        type: 'BLOCKQUOTETEXT',
        mdastType: 'blockquote',
        isStatic: true
      },
      rules: [
        {
          matchMdast: matchParagraph,
          editorModule: 'paragraph',
          editorOptions: {
            type: 'BLOCKQUOTEPARAGRAPH',
            placeholder: 'Zitat-Absatz'
          },
          component: BlockQuoteParagraph,
          rules: paragraphRules
        }
      ]
    },
    figureCaption
  ]
}

const pullQuote = {
  matchMdast: matchQuote,
  component: PullQuote,
  props: (node, index, parent, { ancestors }) => ({
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
export const DYNAMICCOMPONENT_TYPE = 'DYNAMICCOMPONENT'

const mdastToString = node => node
  ? (
    node.value ||
    (node.children && node.children.map(mdastToString).join('')) ||
    ''
  )
  : ''

const createCover = ({ onAudioCoverClick }) => ({
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
      text,
      audio: meta.audioCover && {
        ...meta.audioCover,
        onClick: onAudioCoverClick
      }
    }
  },
  editorModule: 'figure',
  editorOptions: {
    type: COVER_TYPE,
    gallery: false,
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
        label: 'Gross',
        props: {size: 'breakout'}
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
})

const logbook = {
  matchMdast: matchZone('LOGBOOK'),
  component: ({ children }) => <div>{children}</div>,
  editorModule: 'logbook',
  editorOptions: {
    insertButtonText: 'Logbuch'
  },
  rules: [
    {
      matchMdast: matchHeading(2),
      component: Editorial.Subhead,
      editorModule: 'headline',
      editorOptions: {
        placeholder: 'Titel',
        type: 'LOGBOOK_TITLE',
        depth: 2,
        isStatic: true
      },
      rules: globalInlines
    },
    {
      matchMdast: matchParagraph,
      component: Editorial.Credit,
      editorModule: 'paragraph',
      editorOptions: {
        type: 'LOGBOOK_CREDIT',
        placeholder: 'Autoren, Datum',
        isStatic: true,
        afterType: 'PARAGRAPH',
        insertAfterType: 'CENTER'
      },
      rules: [...globalInlines, link]
    }
  ]

}

const mdastPlaceholder = '\u2063'
const DefaultLink = ({ children }) => children

const createSchema = ({
  documentEditorOptions = {},
  customMetaFields = [
    {
      label: 'Bildergalerie aktiv',
      key: 'gallery',
      ref: 'bool'
    },
    {
      label: 'Icon: Bildergalerie',
      key: 'indicateGallery',
      ref: 'bool'
    },
    {
      label: 'Icon: Video',
      key: 'indicateVideo',
      ref: 'bool'
    },
    {
      label: 'Icon: Chart',
      key: 'indicateChart',
      ref: 'bool'
    },
    {
      label: 'Keine Leseposition (z.B. für Videoartikel)',
      key: 'disableTextProgress',
      ref: 'bool'
    },
    {
      label: 'Diskussion geschlossen',
      key: 'discussionClosed',
      ref: 'bool'
    },
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
  t = () => '',
  dynamicComponentRequire,
  previewTeaser,
  getVideoPlayerProps = props => props,
  onAudioCoverClick
} = {}) => {
  const teasers = createTeasers({
    t,
    Link
  })

  const cover = createCover({onAudioCoverClick})
  const dynamicComponent = createDynamicComponent({
    t,
    dynamicComponentRequire,
    insertButtonText: 'Dynamic Component',
    type: DYNAMICCOMPONENT_TYPE
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
              teaser: previewTeaser || (props => (
                <div
                  style={{
                    backgroundColor: '#fff',
                    padding: '30px 30px 1px'
                  }}
                >
                  <TeaserFeed {...props} />
                </div>
              ))
            }
          },
          cover,
          addProgressProps(dynamicComponent),
          titleBlockRule || {
            matchMdast: matchZone('TITLE'),
            component: ({children, format, ...props}) => (
              <TitleBlock {...props} format={format} Link={Link}>
                {titleBlockPrepend}
                {format && format.meta && (
                  <Editorial.Format color={format.meta.color || colors[format.meta.kind]} contentEditable={false}>
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
              coverType: COVER_TYPE,
              dynamicComponentCoverType: DYNAMICCOMPONENT_TYPE
            },
            rules: [
              {
                matchMdast: matchHeading(1),
                component: ({ children, attributes, format, coverText }) => {
                  const Headline = (
                    format && format.meta && format.meta.kind === 'meta'
                  )
                    ? Interaction.Headline
                    : format && format.meta && format.meta.kind === 'scribble'
                      ? Scribble.Headline
                      : Editorial.Headline

                  const element = <Headline attributes={attributes}>{children}</Headline>

                  if (coverText) {
                    return <CoverTextTitleBlockHeadline>
                      {element}
                    </CoverTextTitleBlockHeadline>
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
                rules: globalInlines,
                editorModule: 'headline',
                editorOptions: {
                  type: 'H1',
                  placeholder: 'Titel',
                  depth: 1,
                  isStatic: true
                }
              },
              {
                matchMdast: matchHeading(2),
                component: ({ children, attributes, ...props }) =>
                  <Editorial.Subject attributes={attributes} {...props}>
                    {children}
                  </Editorial.Subject>,
                editorModule: 'headline',
                editorOptions: {
                  type: 'SUBJECT',
                  placeholder: 'Subject',
                  depth: 2,
                  isStatic: true
                },
                rules: globalInlines
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
            // prevent empty data object forward to component
            // - Center spreads all props onto its div
            props: () => ({}),
            editorModule: 'center',
            rules: [
              {
                matchMdast: matchHeading(2),
                props: node => ({
                  slug: slug(mdastToString(node))
                }),
                component: ({ children, slug }) => <Editorial.Subhead>
                  <a {...styles.anchor} id={slug} />
                  {children}
                </Editorial.Subhead>,
                editorModule: 'headline',
                editorOptions: {
                  type: 'H2',
                  depth: 2,
                  formatButtonText: 'Zwischentitel',
                  afterType: 'PARAGRAPH',
                  insertAfterType: 'CENTER'
                },
                rules: globalInlines
              },
              {
                matchMdast: matchZone('FIGUREGROUP'),
                component: FigureGroup,
                props: node => {
                  return {
                    size: node.data.size || 'breakout',
                    columns: node.data.columns
                  }
                },
                rules: [figure, centerFigureCaption],
                editorModule: 'figuregroup',
                editorOptions: {
                  insertButtonText: 'Bildergruppe',
                  insertTypes: [
                    'PARAGRAPH'
                  ]
                }
              },
              list,
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
              logbook,
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
                        {...getVideoPlayerProps(data)}
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
              createInfoBox({ t }),
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
                    rules: paragraphRules
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
                    rules: paragraphRules
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
                    rules: paragraphRules
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
              },
              dynamicComponent
            ].map(addProgressProps)
          },
          addProgressProps(centerFigure),
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
