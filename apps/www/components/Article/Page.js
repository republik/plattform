import { cloneElement, useRef, useEffect, useMemo } from 'react'
import { css } from 'glamor'
import Link from 'next/link'
import { useRouter } from 'next/router'
import compose from 'lodash/flowRight'
import { useQuery } from '@apollo/client'

import {
  Center,
  Breakout,
  colors,
  Interaction,
  SeriesNav,
} from '@project-r/styleguide'

import withT from '../../lib/withT'
import { parseJSONObject } from '../../lib/safeJSON'
import withInNativeApp from '../../lib/withInNativeApp'
import { splitByTitle } from '../../lib/utils/mdast'
import { useMe } from '../../lib/context/MeContext'
import { cleanAsPath } from '../../lib/utils/link'
import useProlitterisTracking from '../../lib/hooks/useProlitterisTracking'

import DiscussionContextProvider from '../Discussion/context/DiscussionContextProvider'
import Discussion from '../Discussion/Discussion'
import FontSizeSync from '../FontSize/Sync'
import PageLoader from '../Loader'
import Frame from '../Frame'
import ActionBar from '../ActionBar'
import FormatFeed from '../Feed/Format'
import StatusError from '../StatusError'
import NewsletterSignUp from '../Auth/NewsletterSignUp'
import ArticleGallery from '../Gallery/ArticleGallery'
import SectionNav from '../Sections/SinglePageNav'
import SectionFeed from '../Sections/SinglePageFeed'
import { withMarkAsReadMutation } from '../Notifications/enhancers'
import ShareImageFlyer from '../Flyer/ShareImage'
import Flyer from '../Flyer'
import { getMetaData, runMetaFromQuery } from './metadata'
import ActionBarOverlay from './ActionBarOverlay'
import SeriesNavBar from './SeriesNavBar'
import Extract from './Extract'
import Progress from './Progress'
import PodcastButtons from './PodcastButtons'
import { getDocument } from './graphql/getDocument'
import ShareImage from './ShareImage'
import ArticleRecommendationsFeed from './ArticleRecommendationsFeed'
import useAudioQueue from '../Audio/hooks/useAudioQueue'
import { ArticleAudioPlayer } from '../Audio/AudioPlayer/ArticleAudioPlayer'
import { reportError } from 'lib/errors/reportError'
import NewsletterTitleBlock from './components/NewsletterTitleBlock'
import PublikatorLinkBlock from './components/PublikatorLinkBlock'
import useSchema from './useSchema'

const EmptyComponent = ({ children }) => children

const ArticlePage = ({
  t,
  inNativeApp,
  isPreview,
  markAsReadMutation,
  serverContext,
  clientRedirection,
}) => {
  const actionBarRef = useRef()
  const bottomActionBarRef = useRef()
  const galleryRef = useRef()

  const router = useRouter()
  const { share, extract, showAll } = router.query

  const { me, meLoading, hasAccess, isEditor } = useMe()

  const { isAudioQueueAvailable } = useAudioQueue()

  const showPlayButton = !extract && hasAccess && isAudioQueueAvailable

  const cleanedPath = cleanAsPath(router.asPath)

  const {
    data: articleData,
    loading: articleLoading,
    error: articleError,
    refetch: articleRefetch,
  } = useQuery(getDocument, {
    variables: {
      path: cleanedPath,
    },
    skip: clientRedirection,
    // When graphQLErrors happen, we still want to get partial data to render the page
    errorPolicy: 'all',
  })

  useEffect(() => {
    if (articleError) {
      reportError('Article Page getDocument Query', articleError)
    }
  }, [articleError])

  const article = articleData?.article
  const documentId = article?.id
  const repoId = article?.repoId
  const treeType = article?.type

  const articleMeta = article?.meta
  const articleContent = article?.content
  const articleUnreadNotifications = article?.unreadNotifications
  const routerQuery = router.query

  useProlitterisTracking(repoId, cleanedPath)

  useEffect(() => {
    if (share) {
      document.getElementById(share)?.scrollIntoView()
    }
  }, [share])

  // Refetch when cached article is not issued for current user
  // - SSG always provides issuedForUserId: null
  // Things that can change
  // - content member only parts like «also read»
  // - personalized data for action bar
  const needsRefetch =
    !articleLoading &&
    !meLoading &&
    (article?.issuedForUserId || null) !== (me?.id || null)
  useEffect(() => {
    if (needsRefetch) {
      articleRefetch()
    }
  }, [
    needsRefetch,
    articleRefetch,
    // ensure effect is run when article or me changes
    me?.id,
    documentId,
  ])

  if (isPreview && !articleLoading && !article && serverContext) {
    serverContext.res.redirect(302, router.asPath.replace(/^\/vorschau\//, '/'))
    throw new Error('redirect')
  }

  useEffect(() => {
    const unreadNotifications = articleUnreadNotifications?.nodes?.filter(
      (n) => !n.readAt,
    )
    if (unreadNotifications?.length) {
      unreadNotifications.forEach((n) => markAsReadMutation(n.id))
    }
  }, [articleUnreadNotifications, markAsReadMutation])

  const metaJSONStringFromQuery = useMemo(() => {
    return (
      articleContent &&
      JSON.stringify(
        runMetaFromQuery(articleContent.meta.fromQuery, routerQuery),
      )
    )
  }, [routerQuery, articleContent])

  const meta = useMemo(
    () =>
      articleMeta &&
      articleContent && {
        ...getMetaData(documentId, articleMeta),
        ...(metaJSONStringFromQuery
          ? JSON.parse(metaJSONStringFromQuery)
          : undefined),
      },
    [articleMeta, articleContent, metaJSONStringFromQuery, documentId],
  )

  const { renderSchema, schema } = useSchema({
    meta,
    article,
    showPlayButton,
  })

  const hasMeta = !!meta
  const podcast =
    hasMeta &&
    (meta.podcast || (meta.audioSource && meta.format?.meta?.podcast))

  const hasAudioSource = !!meta?.audioSource
  const newsletterMeta =
    hasMeta && (meta.newsletter || meta.format?.meta?.newsletter)

  const isSeriesOverview = hasMeta && meta.series?.overview?.id === documentId
  const showSeriesNav = hasMeta && !!meta.series && !isSeriesOverview
  const titleBreakout = isSeriesOverview

  const { trialSignup } = routerQuery
  useEffect(() => {
    if (trialSignup === 'success') {
      articleRefetch()
    }
  }, [trialSignup, articleRefetch])

  const template = meta?.template
  const isEditorialNewsletter = template === 'editorialNewsletter'
  const disableActionBar = meta?.disableActionBar
  const actionBar = article && !disableActionBar && (
    <ActionBar
      mode='articleTop'
      document={article}
      documentLoading={articleLoading || needsRefetch}
      shareParam={share}
    />
  )
  const actionBarEnd =
    actionBar && !isSeriesOverview
      ? cloneElement(actionBar, {
          mode: 'articleBottom',
        })
      : undefined

  const actionBarOverlay = actionBar
    ? cloneElement(actionBar, {
        mode: 'articleOverlay',
      })
    : undefined

  const actionBarFlyer = actionBar
    ? cloneElement(actionBar, {
        mode: 'flyer',
        shareParam: undefined,
      })
    : undefined

  const series = meta?.series
  const episodes = series?.episodes
  const darkMode = article?.content?.meta?.darkMode

  const seriesSecondaryNav = showSeriesNav && (
    <SeriesNavBar me={me} series={series} repoId={repoId} />
  )

  const colorMeta =
    meta &&
    (meta.template === 'format' || meta.template === 'section'
      ? meta
      : meta.format && meta.format.meta)
  const formatColor = colorMeta && (colorMeta.color || colors[colorMeta.kind])
  const sectionColor = meta && meta.template === 'section' && meta.color

  const isFlyer = treeType === 'slate'

  if (extract) {
    return (
      <PageLoader
        loading={articleLoading && !articleData}
        render={() => {
          if (!article) {
            return (
              <StatusError
                statusCode={404}
                clientRedirection={clientRedirection}
                serverContext={serverContext}
              />
            )
          }

          if (extract === 'share') {
            return <ShareImage meta={meta} />
          }

          if (isFlyer) {
            return (
              <ShareImageFlyer
                tileId={extract}
                value={article.content.children}
                schema={schema}
                showAll={showAll}
              />
            )
          }

          return (
            <Extract
              ranges={extract}
              schema={schema}
              meta={meta}
              unpack={router.query.unpack}
              mdast={{
                ...article.content,
                format: meta.format,
                section: meta.section,
                series: meta.series,
                repoId: article.repoId,
              }}
            />
          )
        }}
      />
    )
  }

  const splitContent = article && splitByTitle(article.content)
  console.log({ splitContent })

  const hasStickySecondaryNav = meta
    ? meta.template === 'section' || meta.template === 'flyer'
    : true // show/keep around while loading meta
  const hasOverviewNav = !meta?.series // no overview on series, so that seriesNav is rendered
  const colorSchemeKey = darkMode ? 'dark' : 'auto'

  const delegateMetaDown =
    !!isFlyer ||
    !!meta?.delegateDown ||
    !!(meta?.ownDiscussion?.id && router.query.focus) ||
    !!(meta?.ownDiscussion?.isBoard && router.query.parent)

  return (
    <Frame
      raw
      // Meta tags for a focus comment are rendered in Discussion/Commments.js
      meta={!delegateMetaDown && meta}
      secondaryNav={seriesSecondaryNav}
      formatColor={formatColor}
      hasOverviewNav={hasOverviewNav}
      stickySecondaryNav={hasStickySecondaryNav}
      pageColorSchemeKey={colorSchemeKey}
    >
      <PageLoader
        loading={articleLoading && !articleData}
        render={() => {
          if (!article || !schema) {
            return (
              <StatusError
                statusCode={404}
                clientRedirection={clientRedirection}
                serverContext={serverContext}
              />
            )
          }

          const isFormat = meta.template === 'format'
          const isSection = meta.template === 'section'
          const isPage = meta.template === 'page'
          const ownDiscussion = meta.ownDiscussion

          const ProgressComponent =
            !!me &&
            !isSection &&
            !isFormat &&
            !isPage &&
            meta.template !== 'discussion'
              ? Progress
              : EmptyComponent

          const titleNode =
            splitContent.title &&
            splitContent.title.children[splitContent.title.children.length - 1]
          const titleAlign =
            titleNode?.data?.center || isFormat || isSection
              ? 'center'
              : undefined

          const breakout = titleNode?.data?.breakout || titleBreakout

          const isFreeNewsletter = !!newsletterMeta && newsletterMeta.free
          const showNewsletterSignupTop = isFormat && isFreeNewsletter
          const showNewsletterSignupBottom = isFreeNewsletter && !isFormat

          const rawContentMeta = articleContent.meta

          const feedQueryVariables = rawContentMeta.feedQueryVariables
            ? parseJSONObject(rawContentMeta.feedQueryVariables)
            : undefined
          const hideFeed = !!rawContentMeta.hideFeed

          const showAudioPlayer =
            hasAudioSource || article?.meta?.willBeReadAloud

          const hideSectionNav = !!rawContentMeta.hideSectionNav
          const showSectionNav = isSection && !hideSectionNav

          const showBottomActionBar =
            (hasAccess && meta.template === 'article') ||
            (isEditorialNewsletter && newsletterMeta && newsletterMeta.free)

          const showPodcastButtons = !!podcast && meta.template !== 'article'

          return (
            <>
              <FontSizeSync />
              {meta.prepublication && (
                <div {...styles.prepublicationNotice}>
                  <Center breakout={breakout}>
                    <Interaction.P>
                      {t('article/prepublication/notice')}
                    </Interaction.P>
                  </Center>
                </div>
              )}
              {isFlyer ? (
                <Flyer
                  meta={meta}
                  documentId={documentId}
                  inNativeApp={inNativeApp}
                  repoId={repoId}
                  actionBar={actionBarFlyer}
                  value={article.content.children}
                  tileId={share}
                />
              ) : (
                <ArticleGallery
                  article={article}
                  show={!!router.query.gallery}
                  ref={galleryRef}
                >
                  <ProgressComponent article={article}>
                    <article style={{ display: 'block' }}>
                      {splitContent.title && (
                        <div {...styles.titleBlock}>
                          {renderSchema(splitContent.title)}
                          <NewsletterTitleBlock meta={meta} />
                          {isEditor && repoId && disableActionBar && (
                            <PublikatorLinkBlock
                              breakout={breakout}
                              center={titleAlign === 'center'}
                              repoId={repoId}
                            />
                          )}
                          {(showNewsletterSignupTop ||
                            actionBar ||
                            showAudioPlayer ||
                            showSectionNav) && (
                            <Center breakout={breakout} {...styles.hidePrint}>
                              {showNewsletterSignupTop && (
                                <div {...styles.newsletterSignUpTop}>
                                  <NewsletterSignUp
                                    {...newsletterMeta}
                                    smallButton
                                    showDescription
                                  />
                                </div>
                              )}
                              {actionBar && (
                                <div
                                  ref={actionBarRef}
                                  {...styles.actionBarContainer}
                                  style={{
                                    textAlign: titleAlign,
                                    marginBottom: isEditorialNewsletter
                                      ? 0
                                      : undefined,
                                  }}
                                >
                                  {actionBar}
                                </div>
                              )}

                              {showAudioPlayer && (
                                <div style={{ marginTop: 32 }}>
                                  <ArticleAudioPlayer document={article} />
                                </div>
                              )}

                              {showSectionNav && (
                                <Breakout size='breakout'>
                                  <SectionNav
                                    color={sectionColor}
                                    linkedDocuments={article.linkedDocuments}
                                  />
                                </Breakout>
                              )}
                            </Center>
                          )}
                        </div>
                      )}
                      {renderSchema(splitContent.main)}
                    </article>
                    <ActionBarOverlay>{actionBarOverlay}</ActionBarOverlay>
                  </ProgressComponent>
                </ArticleGallery>
              )}
              <div {...styles.hidePrint}>
                {meta.template === 'discussion' && ownDiscussion && (
                  <Center breakout={breakout}>
                    <DiscussionContextProvider
                      discussionId={ownDiscussion.id}
                      isBoardRoot={ownDiscussion.isBoard}
                    >
                      <Discussion documentMeta={rawContentMeta} showPayNotes />
                    </DiscussionContextProvider>
                  </Center>
                )}
                {showNewsletterSignupBottom && (
                  <Center
                    breakout={breakout}
                    {...styles.newsletterSignUpBottom}
                  >
                    <NewsletterSignUp
                      showTitle
                      showDescription
                      {...newsletterMeta}
                    />
                  </Center>
                )}
                {showBottomActionBar && (
                  <Center breakout={breakout}>
                    <div ref={bottomActionBarRef}>{actionBarEnd}</div>
                  </Center>
                )}
                {showPodcastButtons && (
                  <Center breakout={breakout}>
                    <Interaction.H3>{t(`PodcastButtons/title`)}</Interaction.H3>
                    <PodcastButtons {...podcast} />
                  </Center>
                )}
                {episodes && !isSeriesOverview && (
                  <SeriesNav
                    inline
                    repoId={repoId}
                    series={series}
                    ActionBar={me && ActionBar}
                    Link={Link}
                    t={t}
                    seriesDescription={false}
                  />
                )}
                {isSection && !hideFeed && (
                  <SectionFeed
                    key={`sectionFeed${article?.issuedForUserId}`}
                    formats={article.linkedDocuments.nodes.map((n) => n.id)}
                    variables={feedQueryVariables}
                  />
                )}
                {isFormat && !hideFeed && (
                  <FormatFeed
                    key={`formatFeed${article?.issuedForUserId}`}
                    formatId={article.repoId}
                    variables={feedQueryVariables}
                  />
                )}

                {hasAccess && <ArticleRecommendationsFeed path={cleanedPath} />}
              </div>
            </>
          )
        }}
      />
    </Frame>
  )
}

const styles = {
  prepublicationNotice: css({
    backgroundColor: colors.social,
  }),
  titleBlock: css({
    marginBottom: 20,
  }),
  actionBarContainer: css({
    marginTop: 16,
  }),
  flexCenter: css({
    display: 'flex',
    justifyContent: 'center',
  }),
  newsletterSignUpTop: css({
    marginTop: 10,
  }),
  hidePrint: css({
    '@media print': {
      display: 'none',
    },
  }),
}

const ComposedPage = compose(
  withT,
  withInNativeApp,
  withMarkAsReadMutation,
)(ArticlePage)

export default ComposedPage
