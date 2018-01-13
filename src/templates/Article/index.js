import React from 'react'

import Container from './Container'
import Center from '../../components/Center'
import TitleBlock from '../../components/TitleBlock'
import * as Editorial from '../../components/Typography/Editorial'
import * as Interaction from '../../components/Typography/Interaction'
import { TeaserFeed } from '../../components/TeaserFeed'

import {
  Figure,
  FigureCover,
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

import {
  matchType,
  matchZone,
  matchHeading,
  matchParagraph,
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
  styles
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
        type: 'strong'
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
    type: 'EMPHASIS',
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
  rules: [figureByLine, link, ...globalInlines]
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
  rules: [figureImage, figureCaption]
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
        type: 'CENTEREMPHASIS'
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
    insertTypes: ['PARAGRAPH'],
    type: 'CENTERFIGURE'
  },
  rules: [figureImage, centerFigureCaption]
}

const infoBox = {
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
    insertButtonText: 'Infobox',
    insertTypes: ['PARAGRAPH']
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
      rules: paragraph.rules
    }
  ]
}

const pullQuote = {
  matchMdast: matchQuote,
  component: PullQuote,
  props: node => ({
    size: node.data.size,
    hasFigure: !!node.children.find(matchZone('FIGURE'))
  }),
  editorModule: 'quote',
  editorOptions: {
    insertButtonText: 'Zitat',
    insertTypes: ['PARAGRAPH']
  },
  rules: [
    figure,
    {
      matchMdast: (node, index, parent) =>
        matchParagraph(node) &&
        (index === 0 || !matchLast(node, index, parent)),
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

const cover = {
  matchMdast: (node, index) =>
    matchFigure(node) && index === 0,
  component: FigureCover,
  props: node => ({
    size: node.data.size
  }),
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
        props: { size: 'center' }
      },
      {
        label: 'Klein',
        props: { size: 'tiny' }
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
  Link = DefaultLink
} = {}) => {
  const teasers = createTeasers({
    Link
  })

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
            component: ({ children, format, ...props }) => (
              <TitleBlock
                {...props}
                format={format}
                Link={Link}
              >
                {titleBlockPrepend}
                {format &&
                  format.meta && (
                    <Editorial.Format
                      color={format.meta.color}
                      contentEditable={false}
                    >
                      <Link
                        href={format.meta.path}
                        passHref
                      >
                        <a
                          {...styles.link}
                          href={format.meta.path}
                        >
                          {format.meta.title}
                        </a>
                      </Link>
                    </Editorial.Format>
                  )}
                {children}
                {titleBlockAppend}
              </TitleBlock>
            ),
            props: (
              node,
              index,
              parent,
              { ancestors }
            ) => ({
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
                component: ({
                  children,
                  attributes,
                  format,
                  meta
                }) => {
                  const Headline =
                    format &&
                    format.meta &&
                    format.meta.kind === 'meta'
                      ? Interaction.Headline
                      : Editorial.Headline
                  return (
                    <Headline attributes={attributes}>
                      {children}
                    </Headline>
                  )
                },
                props: (
                  node,
                  index,
                  parent,
                  { ancestors }
                ) => {
                  const rootNode =
                    ancestors[ancestors.length - 1]
                  return {
                    format: rootNode.format
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
                component: ({ children, ...props }) => {
                  if (
                    children &&
                    children.length === 1 &&
                    children[0] === mdastPlaceholder
                  ) {
                    return null
                  }
                  return (
                    <Editorial.Lead
                      children={children}
                      {...props}
                    />
                  )
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
                }
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
                  insertTypes: ['PARAGRAPH']
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
                  if (data.src) {
                    return (
                      <VideoPlayer
                        attributes={attributes}
                        {...data}
                      />
                    )
                  }
                  return (
                    <Video
                      attributes={attributes}
                      {...data}
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
              centerFigure,
              teasers.articleCollection
            ]
          },
          cover,
          figure,
          {
            editorModule: 'specialchars'
          }
        ]
      }
    ]
  }
}

export default createSchema
