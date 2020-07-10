import React from 'react'

import Container from './Container'
import Center from '../../components/Center'
import Button from '../../components/Button'
import TitleBlock from '../../components/TitleBlock'
import { HR } from '../../components/Typography'
import * as Editorial from '../../components/Typography/Editorial'
import * as Meta from '../../components/Typography/Meta'
import * as Scribble from '../../components/Typography/Scribble'
import { TeaserFeed } from '../../components/TeaserFeed'
import IllustrationHtml from '../../components/IllustrationHtml'
import CsvChart from '../../components/Chart/Csv'
import { ChartTitle, ChartLead } from '../../components/Chart'
import ErrorBoundary from '../../components/ErrorBoundary'

import { Figure, CoverTextTitleBlockHeadline } from '../../components/Figure'

import { Tweet } from '../../components/Social'
import { Video } from '../../components/Video'
import { VideoPlayer } from '../../components/VideoPlayer'
import { AudioPlayer } from '../../components/AudioPlayer'

import {
  matchType,
  matchZone,
  matchHeading,
  matchParagraph,
  matchImage
} from 'mdast-react-render/lib/utils'

import { matchLast, globalInlines, styles, getDatePath } from './utils'

import colors from '../../theme/colors'
import createBase from './base'
import createBlocks from './blocks'
import createTeasers from './teasers'
import createDynamicComponent from './dynamicComponent'

const getProgressId = (node, index, parent, { ancestors }) => {
  if (parent.identifier === 'CENTER') {
    const rootNode = ancestors[ancestors.length - 1]
    const indexOfParent =
      rootNode && rootNode.children.length && rootNode.children.indexOf(parent)

    // Do not add Progress ID for last element of last center component, if elements are infoboxes or articlecollections
    if (
      index === parent.children.length - 1 &&
      rootNode &&
      indexOfParent === rootNode.children.length - 1
    ) {
      if (
        node.identifier === 'INFOBOX' ||
        node.identifier === 'ARTICLECOLLECTION'
      ) {
        return
      }
    }

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
  return progressId
    ? {
        attributes: {
          'data-pos': progressId
        }
      }
    : {}
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

export const COVER_TYPE = 'COVERFIGURE'
export const DYNAMICCOMPONENT_TYPE = 'DYNAMICCOMPONENT'

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
  titleMargin = true,
  repoPrefix = 'article-',
  series = true,
  darkMode = true,
  paynotes = true,
  Link = DefaultLink,
  getPath = getDatePath,
  t = () => '',
  plattformUnauthorizedZoneText,
  dynamicComponentRequire,
  previewTeaser,
  getVideoPlayerProps = props => props,
  onAudioCoverClick,
  metaBody = false
} = {}) => {
  const base = createBase({ metaBody })
  const blocks = createBlocks({
    COVER_TYPE,
    base,
    t,
    onAudioCoverClick
  })
  const teasers = createTeasers({
    t,
    Link,
    plattformUnauthorizedZoneText
  })

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
              darkMode,
              paynotes,
              customFields: customMetaFields,
              teaser:
                previewTeaser ||
                (props => (
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
          blocks.cover,
          addProgressProps(dynamicComponent),
          titleBlockRule || {
            matchMdast: matchZone('TITLE'),
            component: ({ children, format, ...props }) => (
              <TitleBlock {...props} format={format} margin={titleMargin}>
                {titleBlockPrepend}
                {format && format.meta && (
                  <Editorial.Format
                    color={format.meta.color || colors[format.meta.kind]}
                    contentEditable={false}
                  >
                    <Link href={format.meta.path} passHref>
                      <a {...styles.link} href={format.meta.path}>
                        {format.meta.title}
                      </a>
                    </Link>
                  </Editorial.Format>
                )}
                {children}
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
                component: ({ children, attributes, format, meta }) => {
                  const kind =
                    (format && format.meta && format.meta.kind) ||
                    (meta && meta.kind)

                  const Headline =
                    kind === 'meta'
                      ? Meta.Headline
                      : kind === 'scribble'
                      ? Scribble.Headline
                      : Editorial.Headline

                  const element = (
                    <Headline attributes={attributes}>{children}</Headline>
                  )

                  if (meta && meta.coverText) {
                    return (
                      <CoverTextTitleBlockHeadline>
                        {element}
                      </CoverTextTitleBlockHeadline>
                    )
                  }

                  return element
                },
                props: (node, index, parent, { ancestors }) => {
                  const rootNode = ancestors[ancestors.length - 1]
                  return {
                    format: rootNode.format,
                    meta: rootNode.meta
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
                component: ({ children, attributes, ...props }) => (
                  <Editorial.Subject attributes={attributes} {...props}>
                    {children}
                  </Editorial.Subject>
                ),
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
                  return matchParagraph(node) && index === numHeadings
                },
                component: ({ children, ...props }) => {
                  if (
                    children &&
                    children.length === 1 &&
                    children[0] === mdastPlaceholder
                  ) {
                    return null
                  }
                  const Lead = metaBody ? Meta.Lead : Editorial.Lead
                  return <Lead children={children} {...props} />
                },
                editorModule: 'paragraph',
                editorOptions: {
                  type: 'LEAD',
                  placeholder: 'Lead',
                  mdastPlaceholder,
                  isStatic: true
                },
                rules: [...globalInlines, base.link]
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
                rules: [...globalInlines, base.link]
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
              base.subhead,
              base.figureGroup,
              {
                matchMdast: matchZone('BUTTON'),
                component: ({ children, ...props }) => (
                  <Button {...props} spacedOut>
                    {children}
                  </Button>
                ),
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
              base.list,
              {
                matchMdast: matchType('thematicBreak'),
                component: HR,
                editorModule: 'line',
                editorOptions: {
                  insertButtonText: 'Trennlinie',
                  insertTypes: ['PARAGRAPH']
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
              blocks.logbook,
              {
                matchMdast: matchZone('EMBEDVIDEO'),
                component: ({ attributes, data, url }) => {
                  if (data.forceAudio && data.src) {
                    return (
                      <AudioPlayer attributes={attributes} {...data} t={t} />
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
              blocks.infoBox,
              blocks.pullQuote,
              base.paragraph,
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
                    rules: base.paragraphRules
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
                  insertTypes: ['PARAGRAPH']
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
                    rules: base.paragraphRules
                  },
                  {
                    matchMdast: matchType('code'),
                    component: ({ showException, ...props }) => (
                      <ErrorBoundary
                        showException={showException}
                        failureMessage={t('styleguide/charts/error')}
                      >
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
                      style: { marginTop: 10 }
                    }),
                    editorModule: 'paragraph',
                    editorOptions: {
                      type: 'CHARTNOTE',
                      placeholder: 'Quelle',
                      isStatic: true,
                      afterType: 'PARAGRAPH',
                      insertAfterType: 'CENTER'
                    },
                    rules: base.paragraphRules
                  }
                ]
              },
              base.centerFigure,
              teasers.articleCollection,
              blocks.blockQuote,
              {
                matchMdast: matchZone('HTML'),
                component: IllustrationHtml,
                props: node => {
                  const code = node.children.find(c => c.type === 'code')
                  const deepNodes = node.children
                    .reduce(
                      (children, child) =>
                        children.concat(child).concat(child.children),
                      []
                    )
                    .filter(Boolean)
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
                  insertTypes: ['PARAGRAPH'],
                  insertButtonText: 'HTML Illustration'
                },
                isVoid: true
              },
              dynamicComponent
            ].map(addProgressProps)
          },
          addProgressProps(base.centerFigure),
          teasers.carousel,
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
