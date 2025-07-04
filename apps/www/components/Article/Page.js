import { useQuery } from '@apollo/client'
import NextReads from '@app/components/next-reads'
import PaynoteInline from '@app/components/paynotes/paynote/paynote-inline'
import { usePaynotes } from '@app/components/paynotes/paynotes-context'
import { WelcomeBanner } from '@app/components/paynotes/paynotes-in-trial/welcome'
import Paywall from '@app/components/paynotes/paywall'
import Regwall from '@app/components/paynotes/regwall'

import {
  Breakout,
  Center,
  colors,
  Interaction,
  SeriesNav,
} from '@project-r/styleguide'
import { css } from 'glamor'
import { reportError } from 'lib/errors/reportError'
import compose from 'lodash/flowRight'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { cloneElement, useEffect, useMemo, useRef } from 'react'
import { useMe } from '../../lib/context/MeContext'
import useProlitterisTracking from '../../lib/hooks/useProlitterisTracking'
import { parseJSONObject } from '../../lib/safeJSON'
import { cleanAsPath } from '../../lib/utils/link'
import { splitByTitle } from '../../lib/utils/mdast'
import withInNativeApp from '../../lib/withInNativeApp'

import withT from '../../lib/withT'
import ActionBar from '../ActionBar'
import { ArticleAudioPlayer } from '../Audio/AudioPlayer/ArticleAudioPlayer'
import useAudioQueue from '../Audio/hooks/useAudioQueue'
import NewsletterSignUp from '../Auth/NewsletterSignUp'

import DiscussionContextProvider from '../Discussion/context/DiscussionContextProvider'
import Discussion from '../Discussion/Discussion'
import FormatFeed from '../Feed/Format'
import Flyer from '../Flyer'
import ShareImageFlyer from '../Flyer/ShareImage'
import FontSizeSync from '../FontSize/Sync'
import Frame from '../Frame'
import ArticleGallery from '../Gallery/ArticleGallery'
import PageLoader from '../Loader'
import { withMarkAsReadMutation } from '../Notifications/enhancers'
import SectionFeed from '../Sections/SinglePageFeed'
import SectionNav from '../Sections/SinglePageNav'
import StatusError from '../StatusError'
import { withMarkAsReadMutation } from '../Notifications/enhancers'
import { getMetaData, runMetaFromQuery } from './metadata'
import ActionBarOverlay from './ActionBarOverlay'
import NewsletterTitleBlock from './components/NewsletterTitleBlock'
import PrepubNotice from './components/PrepubNotice'
import PublikatorLinkBlock from './components/PublikatorLinkBlock'
import Extract from './Extract'
import { getDocument } from './graphql/getDocument'
import { getMetaData, runMetaFromQuery } from './metadata'
import PodcastButtons from './PodcastButtons'
import Progress from './Progress'
import SeriesNavBar from './SeriesNavBar'
import ShareImage from './ShareImage'
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

  const { me, meLoading, isEditor } = useMe()
  const { paynoteKind, setTemplateForPaynotes, setIsPaywallExcluded } =
    usePaynotes()
  const hasPaywall = paynoteKind === 'PAYWALL' || paynoteKind === 'REGWALL'

  const { isAudioQueueAvailable } = useAudioQueue()

  const showPlayButton = !extract && !hasPaywall && isAudioQueueAvailable

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

  const template = meta?.template

  // is true if the article or the format are paywall excluded
  const isPaywallExcluded = meta?.isPaywallExcluded
  useEffect(() => {
    const resetPaynotes = () => {
      // console.log('resetPaynotes')
      setTemplateForPaynotes(null)
      setIsPaywallExcluded(false)
    }
    if (hasMeta) {
      // console.log('set template for paynotes', template)
      setTemplateForPaynotes(isSeriesOverview ? 'seriesOverview' : template)
      setIsPaywallExcluded(isPaywallExcluded)
      // we use router events so that the reset happens before the pathname changes
      router.events.on('routeChangeStart', resetPaynotes)
    }
    return () => {
      router.events.off('routeChangeStart', resetPaynotes)
    }
  }, [template, isSeriesOverview, isPaywallExcluded, hasMeta, cleanedPath])

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

  const hasStickySecondaryNav = meta ? meta.template === 'section' : true // show/keep around while loading meta
  const hasOverviewNav = !meta?.series // no overview on series, so that seriesNav is rendered
  const colorSchemeKey = darkMode ? 'dark' : 'auto'

  const delegateMetaDown = !!meta?.delegateDown
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

          const isArticle = meta.template === 'article'
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
            !hasPaywall && (hasAudioSource || article?.meta?.willBeReadAloud)

          const hideSectionNav = !!rawContentMeta.hideSectionNav
          const showSectionNav = isSection && !hideSectionNav

          const showBottomActionBar =
            (!hasPaywall && meta.template === 'article') ||
            (isEditorialNewsletter && newsletterMeta && newsletterMeta.free)

          const showPodcastButtons = !!podcast && meta.template !== 'article'

          return (
            <>
              <FontSizeSync />
              <PrepubNotice meta={meta} breakout={breakout} />
              <WelcomeBanner />

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
                    <div className='regwall'>
                      {hasPaywall ? (
                        <div {...styles.regwallFade}>
                          {renderSchema(splitContent.mainTruncated)}
                        </div>
                      ) : (
                        <>{renderSchema(splitContent.main)}</>
                      )}
                    </div>
                    <Regwall />
                    <Paywall />
                  </article>
                </ProgressComponent>
                <ActionBarOverlay>{actionBarOverlay}</ActionBarOverlay>
              </ArticleGallery>
              <div {...styles.hidePrint}>
                {meta.template === 'discussion' && ownDiscussion && (
                  <Center breakout={breakout}>
                    <DiscussionContextProvider
                      discussionPath={ownDiscussion.path}
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
                <PaynoteInline />
                {episodes && !isSeriesOverview && (
                  <SeriesNav
                    inline
                    repoId={repoId}
                    series={series}
                    ActionBar={me && ActionBar}
                    Link={Link}
                    t={t}
                    seriesDescription={hasPaywall}
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

                {isArticle && !isSeriesOverview && (
                  <NextReads path={cleanedPath} repoId={repoId} />
                )}
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
  regwallFade: css({
    position: 'relative',
    '&:before': {
      content: ' ',
      display: 'block',
      position: 'absolute',
      left: 0,
      bottom: 0,
      right: 0,
      top: 120,
      background: 'var(--color-fadeOutGradientDefault)',
    },
  }),
}

const ComposedPage = compose(
  withT,
  withInNativeApp,
  withMarkAsReadMutation,
)(ArticlePage)

export default ComposedPage
