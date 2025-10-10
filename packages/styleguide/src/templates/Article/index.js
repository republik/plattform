import {
  matchHeading,
  matchImage,
  matchParagraph,
  matchType,
  matchZone,
} from '@republik/mdast-react-render'
import React, { useEffect, useState } from 'react'
import { AudioPlayer } from '../../components/AudioPlayer'
import Button from '../../components/Button'
import Center from '../../components/Center'
import { ChartLead, ChartLegend, ChartTitle } from '../../components/Chart'
import CsvChart from '../../components/Chart/Csv'
import ErrorBoundary from '../../components/ErrorBoundary'

import { CoverTextTitleBlockHeadline, Figure } from '../../components/Figure'
import IllustrationHtml from '../../components/IllustrationHtml'

import { Tweet } from '../../components/Social'

import StoryComponent from '../../components/StoryComponent'
import TeaserEmbedComment from '../../components/TeaserEmbedComment'
import { TeaserFeed } from '../../components/TeaserFeed'
import { getFormatLine } from '../../components/TeaserFeed/utils'

import { TeaserFrontLogo } from '../../components/TeaserFront'
import TitleBlock from '../../components/TitleBlock'
import { HR } from '../../components/Typography'
import * as Editorial from '../../components/Typography/Editorial'
import * as Meta from '../../components/Typography/Meta'
import * as Scribble from '../../components/Typography/Scribble'
import { Video } from '../../components/Video'
import { VideoPlayer } from '../../components/VideoPlayer'
import authorRule from '../shared/email/rules/authorRule'
import elseRule from '../shared/email/rules/elseRule'
import ifRule from '../shared/email/rules/ifRule'
import { embedDataWrapperRule } from '../shared/rules/embedDatawrapperRule'

import createBase from './base'
import createBlocks from './blocks'

import Container from './Container'
import createDynamicComponent from './dynamicComponent'
import createTeasers from './teasers'

import { getDatePath, globalInlines, matchLast, styles } from './utils'

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
          'data-pos': progressId,
        },
      }
    : {}
}

const addProgressProps = (rule) => ({
  ...rule,
  props: rule.props
    ? (...args) => ({
        ...rule.props(...args),
        ...getProgressProps(...args),
      })
    : getProgressProps,
})

export const COVER_TYPE = 'COVERFIGURE'
export const DYNAMICCOMPONENT_TYPE = 'DYNAMICCOMPONENT'

const mdastPlaceholder = '\u2063'
const DefaultLink = ({ children }) => children
const DefaultActionBar = () => null

const withData = (Component) => (props) => <Component {...props} data={{}} />

const createSchema = ({
  documentEditorOptions = { skipCredits: false },
  customMetaFields = [
    {
      label: 'Regwall ausschalten',
      key: 'isPaywallExcluded',
      ref: 'bool',
    },
    {
      label: 'Bildergalerie aktiv',
      key: 'gallery',
      ref: 'bool',
    },
    {
      label: 'Icon: Bildergalerie',
      key: 'indicateGallery',
      ref: 'bool',
    },
    {
      label: 'Icon: Video',
      key: 'indicateVideo',
      ref: 'bool',
    },
    {
      label: 'Icon: Chart',
      key: 'indicateChart',
      ref: 'bool',
    },
    {
      label: 'Keine Leseposition (z.B. für Videoartikel)',
      key: 'disableTextProgress',
      ref: 'bool',
    },
    {
      label: 'Diskussion geschlossen',
      key: 'discussionClosed',
      ref: 'bool',
    },
    {
      label: 'Format',
      key: 'format',
      ref: 'repo',
    },
    {
      label: 'Dossier',
      key: 'dossier',
      ref: 'repo',
    },
    {
      label: 'Diskussion',
      key: 'discussion',
      ref: 'repo',
    },
  ],
  titleBlockRule,
  titleBlockPrepend = null,
  titleMargin = true,
  titleBreakout = false,
  repoPrefix = 'article-',
  series = true,
  darkMode = true,
  Link = DefaultLink,
  getPath = getDatePath,
  t = () => '',
  plattformUnauthorizedZoneText,
  dynamicComponentRequire,
  dynamicComponentIdentifiers,
  previewTeaser,
  getVideoPlayerProps = (props) => props,
  onAudioCoverClick,
  metaBody = false,
  metaHeadlines = false,
  skipContainer = false,
  skipCenter = false,
  withCommentData = withData,
  CommentLink = DefaultLink,
  ActionBar = DefaultActionBar,
  noEmpty = true,
  AudioPlayButton,
} = {}) => {
  const base = createBase({ metaBody, metaHeadlines, Link })
  const blocks = createBlocks({
    COVER_TYPE,
    base,
    t,
    onAudioCoverClick,
  })
  const teasers = createTeasers({
    t,
    Link,
    ActionBar,
    plattformUnauthorizedZoneText,
    AudioPlayButton,
  })

  const dynamicComponent = createDynamicComponent({
    t,
    dynamicComponentRequire,
    dynamicComponentIdentifiers,
    insertButtonText: 'Dynamic Component',
    type: DYNAMICCOMPONENT_TYPE,
  })

  const storyComponent = {
    matchMdast: matchZone('STORYCOMPONENT'),
    component: StoryComponent,
    editorModule: 'storycomponent',
    editorOptions: {
      type: 'STORYCOMPONENT',
      insertButtonText: 'Story Component (Beta)',
      insertTypes: ['PARAGRAPH'],
    },
    isVoid: true,
  }

  const TeaserEmbedCommentWithLiveData = withCommentData(TeaserEmbedComment)
  const TeaserEmbedCommentSwitch = (props) => {
    const [isMounted, setIsMounted] = useState()
    useEffect(() => {
      setIsMounted(true)
    }, [])

    const Embed = isMounted
      ? TeaserEmbedCommentWithLiveData
      : TeaserEmbedComment

    return <Embed {...props} t={t} CommentLink={CommentLink} />
  }

  return {
    repoPrefix,
    getPath,
    // // disabled pending launch and backend support
    // // https://github.com/orbiting/backends/compare/feat-article-email
    emailTemplate: 'article',
    rules: [
      {
        matchMdast: matchType('root'),
        component: ({ children }) =>
          skipContainer ? children : <Container>{children}</Container>,
        editorModule: 'documentPlain',
        editorOptions: documentEditorOptions,
        rules: [
          {
            matchMdast: () => false,
            editorModule: 'meta',
            editorOptions: {
              series,
              darkMode,
              customFields: customMetaFields,
              teaser:
                previewTeaser ||
                ((props) => (
                  <div
                    style={{
                      backgroundColor: '#fff',
                      padding: '30px 30px 1px',
                    }}
                  >
                    <TeaserFeed {...props} />
                  </div>
                )),
            },
          },
          blocks.cover,
          addProgressProps(dynamicComponent),
          addProgressProps(storyComponent),
          addProgressProps(embedDataWrapperRule()),
          titleBlockRule || {
            matchMdast: matchZone('TITLE'),
            component: ({
              children,
              format,
              series,
              repoId,
              path,
              ...props
            }) => {
              const formatLine = getFormatLine({
                format,
                series,
                repoId,
                path,
              })

              return (
                <TitleBlock {...props} format={format} margin={titleMargin}>
                  {titleBlockPrepend}
                  {formatLine.logo && (
                    <TeaserFrontLogo
                      logo={formatLine.logo}
                      logoDark={formatLine.logoDark}
                    />
                  )}
                  {formatLine.title && (
                    <Editorial.Format
                      color={formatLine.color}
                      contentEditable={false}
                    >
                      <Link href={formatLine.path} passHref>
                        <a {...styles.link} href={formatLine.path}>
                          {formatLine.title}
                        </a>
                      </Link>
                    </Editorial.Format>
                  )}
                  {children}
                </TitleBlock>
              )
            },
            props: (node, index, parent, { ancestors }) => {
              const root = ancestors[ancestors.length - 1]
              return {
                center: node.data.center,
                breakout: node.data.breakout ?? titleBreakout,
                format: root.format,
                series: root.series,
                repoId: root.repoId,
                path: root.meta?.path,
              }
            },
            editorModule: 'title',
            editorOptions: {
              coverType: COVER_TYPE,
              dynamicComponentCoverType: DYNAMICCOMPONENT_TYPE,
            },
            rules: [
              {
                matchMdast: matchHeading(1),
                component: ({ children, attributes, format, meta }) => {
                  const kind =
                    (format && format.meta && format.meta.kind) ||
                    (meta && meta.kind)

                  const Headline =
                    metaHeadlines || kind === 'meta'
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
                    meta: rootNode.meta,
                  }
                },
                rules: globalInlines,
                editorModule: 'headline',
                editorOptions: {
                  type: 'H1',
                  placeholder: 'Titel',
                  depth: 1,
                  isStatic: true,
                },
              },
              {
                matchMdast: matchHeading(2),
                component: ({ children, attributes }) => {
                  if (noEmpty && !React.Children.count(children)) return null
                  return (
                    <Editorial.Subject attributes={attributes}>
                      {children}
                    </Editorial.Subject>
                  )
                },
                editorModule: 'headline',
                editorOptions: {
                  type: 'SUBJECT',
                  placeholder: 'Subject',
                  depth: 2,
                  isStatic: true,
                },
                rules: globalInlines,
              },
              {
                matchMdast: (node, index, parent) => {
                  const numHeadings = parent.children.filter(
                    (child) => child.type === 'heading',
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
                  return <Lead {...props}>{children}</Lead>
                },
                editorModule: 'paragraph',
                editorOptions: {
                  type: 'LEAD',
                  placeholder: 'Lead',
                  mdastPlaceholder,
                  isStatic: true,
                },
                rules: [...globalInlines, base.link],
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
                  insertAfterType: 'CENTER',
                },
                rules: [...globalInlines, base.link],
              },
            ],
          },
          {
            matchMdast: matchZone('CENTER'),
            component: ({ children }) =>
              skipCenter ? children : <Center>{children}</Center>,
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
                props: (node) => {
                  const link =
                    (node.children[0] && node.children[0].children[0]) || {}

                  return {
                    ...node.data,
                    title: link.title,
                    href: link.url,
                  }
                },
                rules: globalInlines.concat({
                  matchMdast: matchParagraph,
                  component: ({ children }) => children,
                  rules: [
                    {
                      matchMdast: matchType('link'),
                      component: ({ children }) => children,
                      rules: globalInlines,
                    },
                  ],
                }),
                editorModule: 'button',
              },
              // author block should not render anything in the web
              {
                ...authorRule,
                component: () => null,
              },
              // if-else block should not render anything in the web
              {
                ...ifRule,
                component: () => null,
              },
              {
                ...elseRule,
                component: () => null,
              },
              base.list,
              {
                matchMdast: matchType('thematicBreak'),
                component: HR,
                editorModule: 'line',
                editorOptions: {
                  insertButtonText: 'Trennlinie',
                  insertTypes: ['PARAGRAPH'],
                },
                isVoid: true,
              },
              {
                matchMdast: matchZone('EMBEDTWITTER'),
                component: ({ attributes, data }) => (
                  <Tweet
                    attributes={attributes}
                    {...data}
                    date={new Date(data.createdAt)}
                  />
                ),
                props: (node) => ({
                  data: {
                    ...node.data,
                    url: node.children[0].children[0].url,
                  },
                }),
                editorModule: 'embedTwitter',
                editorOptions: {
                  lookupType: 'PARAGRAPH',
                },
                isVoid: true,
              },
              blocks.logbook,
              {
                matchMdast: matchZone('EMBEDVIDEO'),
                component: ({ attributes, data }) => {
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
                props: (node) => ({
                  data: {
                    ...node.data,
                    url: node.children[0].children[0].url,
                  },
                }),
                editorModule: 'embedVideo',
                editorOptions: {
                  lookupType: 'PARAGRAPH',
                  sizes: [
                    {
                      label: 'Normal',
                      props: { size: undefined },
                    },
                    {
                      label: 'Gross',
                      props: { size: 'breakout' },
                    },
                    {
                      label: 'Mittel',
                      props: { size: 'narrow' },
                    },
                    {
                      label: 'Klein',
                      props: { size: 'tiny' },
                    },
                  ],
                },
                isVoid: true,
              },
              {
                matchMdast: matchZone('EMBEDCOMMENT'),
                props: (node, index, parent) => {
                  const isNotComment = (i) => {
                    if (i < 0 || i > parent.children.length - 1) {
                      return true
                    }
                    return !matchZone('EMBEDCOMMENT')(parent.children[i])
                  }
                  return {
                    isFirst: isNotComment(index - 1),
                    isLast: isNotComment(index + 1),
                    data: {
                      ...node.data,
                      url: node.children[0].children[0].url,
                    },
                  }
                },
                component: TeaserEmbedCommentSwitch,
                editorModule: 'embedComment',
                editorOptions: {
                  lookupType: 'PARAGRAPH',
                },
                isVoid: true,
              },
              blocks.infoBox,
              blocks.pullQuote,
              blocks.interviewAnswer,
              base.paragraph,
              {
                matchMdast: matchZone('NOTE'),
                component: ({ children }) => children,
                editorModule: 'blocktext',
                editorOptions: {
                  mdastType: 'zone',
                  identifier: 'NOTE',
                  formatButtonText: 'Notiz',
                  isStatic: true,
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
                      insertAfterType: 'CENTER',
                    },
                    rules: base.paragraphRules,
                  },
                ],
              },
              {
                matchMdast: matchZone('CHART'),
                component: Figure,
                props: (node) => ({
                  size: node.data.size,
                }),
                editorModule: 'chart',
                editorOptions: {
                  insertButtonText: 'Chart',
                  insertTypes: ['PARAGRAPH'],
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
                      isStatic: true,
                    },
                    rules: globalInlines,
                  },
                  {
                    matchMdast: (node, index, parent) =>
                      matchParagraph(node) && !matchLast(node, index, parent),
                    component: ChartLead,
                    editorModule: 'paragraph',
                    editorOptions: {
                      type: 'CHARTLEAD',
                      placeholder: 'Lead',
                      isStatic: true,
                    },
                    rules: base.paragraphRules,
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
                        values: node.value,
                      }
                    },
                    editorModule: 'chartCanvas',
                  },
                  {
                    matchMdast: (node, index, parent) =>
                      matchParagraph(node) && matchLast(node, index, parent),
                    component: ChartLegend,
                    props: () => ({}),
                    editorModule: 'paragraph',
                    editorOptions: {
                      type: 'CHARTNOTE',
                      placeholder: 'Quelle',
                      isStatic: true,
                      afterType: 'PARAGRAPH',
                      insertAfterType: 'CENTER',
                    },
                    rules: base.paragraphRules,
                  },
                ],
              },
              embedDataWrapperRule(),
              base.centerFigure,
              teasers.articleCollection,
              blocks.blockQuote,
              {
                matchMdast: matchZone('HTML'),
                component: IllustrationHtml,
                props: (node) => {
                  const code = node.children.find((c) => c.type === 'code')
                  const deepNodes = node.children
                    .reduce(
                      (children, child) =>
                        children.concat(child).concat(child.children),
                      [],
                    )
                    .filter(Boolean)
                  const images = deepNodes.filter(matchImage).map((image) => ({
                    ref: image.alt,
                    url: image.url,
                  }))
                  return {
                    code: code && code.value,
                    images,
                  }
                },
                editorModule: 'html',
                editorOptions: {
                  insertTypes: ['PARAGRAPH'],
                  insertButtonText: 'HTML Illustration',
                },
                isVoid: true,
              },
              dynamicComponent,
              storyComponent,
            ].map(addProgressProps),
          },
          addProgressProps(base.centerFigure),
          teasers.carousel,
          teasers.seriesNav,
          {
            matchMdast: () => false,
            editorModule: 'specialchars',
          },
        ],
      },
    ],
  }
}

export default createSchema
