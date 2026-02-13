import { getAnalyticsDashboardUrl } from '@app/lib/analytics/dashboard-url'
import { trackEvent } from '@app/lib/analytics/event-tracking'
import { usePlatformInformation } from '@app/lib/hooks/usePlatformInformation'
import { IconButton, shouldIgnoreClick } from '@project-r/styleguide'
import {
  IconChart,
  IconDownload,
  IconEdit,
  IconEtiquette,
  IconFontSize,
  IconPauseCircleOutline,
  IconPdf,
  IconPlayCircleOutline,
  IconPlaylistAdd,
  IconPlaylistRemove,
  IconPodcast,
  IconReadTime,
  IconShare,
} from '@republik/icons'
import { css } from 'glamor'
import compose from 'lodash/flowRight'
import { Fragment, useState } from 'react'
import { PUBLIC_BASE_URL, PUBLIKATOR_BASE_URL } from '../../lib/constants'
import { useMe } from '../../lib/context/MeContext'

import { splitByTitle } from '../../lib/utils/mdast'

import { postMessage } from '../../lib/withInNativeApp'
import withT from '../../lib/withT'
import PdfOverlay, { getPdfUrl } from '../Article/PdfOverlay'
import { useAudioContext } from '../Audio/AudioProvider'
import useAudioQueue from '../Audio/hooks/useAudioQueue'

import {
  AudioPlayerActions,
  AudioPlayerLocations,
} from '../Audio/types/AudioActionTracking'
import FontSizeOverlay from '../FontSize/Overlay'

import BookmarkButton from './BookmarkButton'
import DiscussionLinkButton from './DiscussionLinkButton'
import PodcastOverlay from './PodcastOverlay'
import ShareOverlay from './ShareOverlay'
import UserProgress, { FeedUserProgress } from './UserProgress'
import { getDiscussionLinkProps } from './utils'

const RenderItems = ({ items }) => (
  <>
    {items.map((props) => (
      <Fragment key={props.title}>
        {props.element || <IconButton key={props.title} {...props} />}
      </Fragment>
    ))}
  </>
)

const ActionBar = ({
  mode,
  document,
  documentLoading,
  t,
  share,
  download,
  discussion,
  fontSize,
  isCentered,
  shareParam,
}) => {
  const { me, meLoading, isEditor, isMember } = useMe()
  const [pdfOverlayVisible, setPdfOverlayVisible] = useState(false)
  const [fontSizeOverlayVisible, setFontSizeOverlayVisible] = useState(false)
  const [shareOverlayVisible, setShareOverlayVisible] = useState(false)
  const [podcastOverlayVisible, setPodcastOverlayVisible] = useState(false)
  const {
    toggleAudioPlayer,
    toggleAudioPlayback,
    addAudioQueueItem,
    removeAudioQueueItem,
    checkIfActivePlayerItem,
    isPlaying,
  } = useAudioContext()
  const { isAudioQueueAvailable, checkIfInQueue } = useAudioQueue()
  const { isNativeApp, isIOS, isAndroid } = usePlatformInformation()

  const handleShareClick = async (e, shareData = {}) => {
    e.preventDefault()
    // shareData is only present on certain pages with no document
    trackEvent(['ActionBar', 'share', shareData.url || shareUrl])
    // in the native app we use postMessage to open the native share UI
    if (isNativeApp) {
      postMessage({
        type: 'share',
        payload: {
          title: shareData.title || document.title,
          url: shareData.url || shareUrl,
          subject: shareData.emailSubject || emailSubject || '',
          dialogTitle: t('article/share/title'),
        },
      })
      e.target.blur()
      // on mobile devices we use Web Share API if supported
    } else if (navigator?.share && (isAndroid || isIOS)) {
      try {
        await navigator.share({
          title: shareData.title || document.title,
          url: shareData.url || shareUrl,
        })
      } catch (e) {}
      // on all other devices we use our share overlay
    } else {
      setShareOverlayVisible(!shareOverlayVisible)
    }
  }

  if (!document) {
    return (
      <div {...styles.topRow} {...(isCentered && { ...styles.centered })}>
        {download && (
          <IconButton href={download} Icon={IconDownload} target='_blank' />
        )}
        {fontSize && (
          <IconButton
            Icon={IconFontSize}
            onClick={(e) => {
              e.preventDefault()
              setFontSizeOverlayVisible(!fontSizeOverlayVisible)
            }}
          />
        )}
        {discussion && me && (
          <IconButton
            Icon={IconEtiquette}
            label={t('components/Discussion/etiquette')}
            labelShort={t('components/Discussion/etiquette')}
            href='/etikette'
          />
        )}
        {share && (
          <IconButton
            label={share.label || ''}
            Icon={IconShare}
            href={share.url}
            onClick={(e) => handleShareClick(e, share)}
          />
        )}
        {shareOverlayVisible && (
          <ShareOverlay
            onClose={() => setShareOverlayVisible(false)}
            url={share.url}
            title={share.overlayTitle || t('article/actionbar/share')}
            emailSubject={share.emailSubject || ''}
            emailBody={share.emailBody || ''}
            emailAttachUrl={share.emailAttachUrl}
          />
        )}
        {fontSizeOverlayVisible && (
          <FontSizeOverlay onClose={() => setFontSizeOverlayVisible(false)} />
        )}
      </div>
    )
  }

  const meta = document && {
    ...document.meta,
    url: `${PUBLIC_BASE_URL}${document.meta.path}`,
  }

  // if share query param is set, it also gets included in the share url
  const shareUrlObj = new URL(meta.url)
  if (shareParam) shareUrlObj.searchParams.set('share', shareParam)
  const shareUrl = shareUrlObj.toString()

  const podcast =
    (meta && meta.podcast) ||
    (meta && meta.audioSource && meta.format && meta.format.meta.podcast)

  const isNewsletterFormat = !!(
    meta?.newsletter || meta?.format?.meta?.newsletter
  )

  const isSeriesOverview = meta && meta.series?.overview?.id === document?.id
  const hasPdf = meta && meta.template === 'article' && !isSeriesOverview
  const notBookmarkable =
    meta?.template === 'page' || meta?.template === 'editorialNewsletter'
  const isDiscussion = meta && meta.template === 'discussion'
  const emailSubject = t('article/share/emailSubject', {
    title: document.meta.title,
  })
  const { discussionId } = getDiscussionLinkProps(
    meta.linkedDiscussion,
    meta.ownDiscussion,
    meta.template,
    meta.path,
  )

  const displayMinutes = meta.estimatedConsumptionMinutes % 60
  const displayHours = Math.floor(meta.estimatedConsumptionMinutes / 60)

  const forceShortLabel =
    mode === 'articleOverlay' ||
    mode === 'feed' ||
    mode === 'bookmark' ||
    mode === 'seriesEpisode'

  // centering
  const splitContent = document.content && splitByTitle(document.content)
  const titleNode =
    splitContent &&
    splitContent.title &&
    splitContent.title.children[splitContent.title.children.length - 1]
  const centered =
    (mode !== 'feed' && titleNode?.data?.center && mode !== 'articleBottom') ||
    (mode !== 'feed' && meta.template === 'format') ||
    (mode !== 'feed' && meta.template === 'section')

  const hours =
    displayHours > 0
      ? t.pluralize('feed/actionbar/readingTime/hours', { count: displayHours })
      : ''
  const minutes =
    displayMinutes > 0
      ? t.pluralize('feed/actionbar/readingTime/minutes', {
          count: displayMinutes,
        })
      : ''
  const minutesShort =
    displayMinutes > 0
      ? t.pluralize('feed/actionbar/readingTime/minutesShort', {
          count: displayMinutes,
        })
      : ''

  const readingTimeTitle = t('feed/actionbar/readingTime/title', {
    minutes,
    hours,
  })
  const readingTimeLabel = !forceShortLabel
    ? `${hours}${minutes}`
    : `${hours}${minutesShort}`
  const readingTimeLabelShort = `${hours}${minutesShort}`

  const showReadingTime =
    (displayMinutes > 0 || displayHours > 0) &&
    (meta.template === 'article' || meta.template === 'editorialNewsletter')

  const isArticleBottom = mode === 'articleBottom'

  const isActiveAudioItem = checkIfActivePlayerItem(document.id)
  const itemPlaying = isPlaying && isActiveAudioItem
  const itemInAudioQueue = checkIfInQueue(document.id)

  const play = () => {
    toggleAudioPlayer(
      {
        id: document.id,
        meta: {
          title: meta.title,
          path: meta.path,
          publishDate: meta.publishDate,
          image: meta.image,
          audioSource: meta.audioSource,
        },
      },
      AudioPlayerLocations.ACTION_BAR,
    )
  }

  const ActionItems = [
    {
      title: readingTimeTitle,
      Icon: IconReadTime,
      label: readingTimeLabel,
      labelShort: readingTimeLabelShort,
      modes: ['feed', 'seriesEpisode'],
      show: showReadingTime,
    },
    {
      title: t('article/actionbar/userprogress'),
      element: (
        <UserProgress
          documentPath={document.meta.path}
          forceShortLabel={forceShortLabel}
          noCallout={true}
          noScroll={false}
          displayMinutes={displayMinutes}
        />
      ),
      modes: ['articleOverlay', 'bookmark', 'seriesEpisode'],
      show: !!document,
    },
    // The feed document query provides user progress for the feed documents directly
    // so we don't use the UserProgress component here, which fetches the progress itself
    {
      title: t('feed/actionbar/userprogress'),
      element: (
        <FeedUserProgress
          progressPercentage={Math.round(
            document.userProgress?.max?.percentage * 100,
          )}
        />
      ),
      modes: ['feed'],
      show: !!document.userProgress?.max?.percentage,
    },
    {
      title: t('article/actionbar/pdf/options'),
      Icon: IconPdf,
      href: hasPdf ? getPdfUrl(meta) : undefined,
      onClick: (e) => {
        if (shouldIgnoreClick(e)) {
          return
        }
        e.preventDefault()
        setPdfOverlayVisible(!pdfOverlayVisible)
      },
      modes: ['articleTop', 'articleBottom'],
      show: hasPdf && isMember,
    },
    {
      title: t('article/actionbar/fontSize/title'),
      Icon: IconFontSize,
      href: meta.url,
      onClick: (e) => {
        e.preventDefault()
        setFontSizeOverlayVisible(!fontSizeOverlayVisible)
      },
      modes: ['articleTop'],
      show: true,
    },
    {
      title: t('bookmark/title/default'),
      element: (
        <span data-show-if-active-membership style={{ marginRight: 24 }}>
          <BookmarkButton
            bookmarked={document && !!document.userBookmark}
            documentId={document.id}
            label={!forceShortLabel ? t('bookmark/label') : ''}
            labelShort={
              !forceShortLabel && isArticleBottom ? t('bookmark/label') : ''
            }
            disabled={meLoading || documentLoading}
          />
        </span>
      ),
      modes: [
        'articleTop',
        'articleBottom',
        'articleOverlay',
        'feed',
        'bookmark',
        'seriesEpisode',
      ],
      show: !notBookmarkable && (meLoading || isMember),
    },
    {
      title: t('article/actionbar/share'),
      Icon: IconShare,
      href: shareUrl,
      onClick: (e) => handleShareClick(e),
      label: !forceShortLabel
        ? t(
            `article/actionbar/${mode}/share`,
            undefined,
            t('article/actionbar/share'),
          )
        : '',
      labelShort:
        !forceShortLabel && isArticleBottom
          ? t(
              `article/actionbar/${mode}/share`,
              undefined,
              t('article/actionbar/share'),
            )
          : '',
      modes: ['articleTop', 'articleOverlay', 'articleBottom'],
      show: true,
    },
    {
      title: readingTimeTitle,
      Icon: IconReadTime,
      label: readingTimeLabel,
      labelShort: readingTimeLabelShort,
      show: showReadingTime,
      modes: ['articleTop'],
      group: 'secondary',
    },
    {
      title: t('article/actionbar/userprogress'),
      element: (
        <UserProgress
          documentPath={document.meta.path}
          displayMinutes={displayMinutes}
        />
      ),
      show: !!document,
      modes: ['articleTop'],
      group: 'secondary',
    },
    {
      title: t('article/actionbar/discussion'),
      element: (
        <DiscussionLinkButton
          t={t}
          document={document}
          isOnArticlePage={[
            'articleTop',
            'articleOverlay',
            'articleBottom',
          ].includes(mode)}
          useCallToActionLabel={isArticleBottom}
          forceShortLabel={forceShortLabel}
        />
      ),
      modes: [
        'articleTop',
        'articleOverlay',
        'articleBottom',
        'feed',
        'seriesEpisode',
      ],
      show: !!discussionId,
    },
    {
      title: t('feed/actionbar/edit'),
      element: (
        <IconButton
          Icon={IconEdit}
          href={`${PUBLIKATOR_BASE_URL}/repo/${document?.repoId}/tree`}
          target='_blank'
          title={t('feed/actionbar/edit')}
          fill={'#E9A733'}
        />
      ),
      modes: ['articleTop'],
      show: document?.repoId && isEditor,
    },
    {
      title: t('feed/actionbar/edit'),
      element: (
        <IconButton
          Icon={IconChart}
          href={getAnalyticsDashboardUrl(meta.path)}
          target='_blank'
          title={'Statistiken auf Plausible'}
          fill={'#E9A733'}
        />
      ),
      modes: ['articleTop'],
      show: document?.repoId && isEditor && getAnalyticsDashboardUrl(meta.path),
    },
    {
      title: t('article/actionbar/audio/play'),
      label: !forceShortLabel ? t('article/actionbar/audio/play') : '',
      Icon: itemPlaying ? IconPauseCircleOutline : IconPlayCircleOutline,
      onClick: !itemPlaying
        ? isActiveAudioItem
          ? toggleAudioPlayback
          : play
        : toggleAudioPlayback,
      modes: ['feed', 'seriesEpisode'],
      show: isMember && meta.audioSource?.mp3,
      group: 'audio',
    },
    {
      title: t(`AudioPlayer/Queue/${itemInAudioQueue ? 'Remove' : 'Add'}`),
      label: !forceShortLabel
        ? t(
            `article/actionbar/audio/queue/${
              itemInAudioQueue ? 'remove' : 'add'
            }`,
          )
        : '',
      Icon: itemInAudioQueue ? IconPlaylistRemove : IconPlaylistAdd,
      onClick: async (e) => {
        e.preventDefault()
        if (itemInAudioQueue) {
          await removeAudioQueueItem(itemInAudioQueue.id)
          trackEvent([
            AudioPlayerLocations.ACTION_BAR,
            AudioPlayerActions.REMOVE_QUEUE_ITEM,
            meta?.path,
          ])
        } else {
          await addAudioQueueItem(document)
          trackEvent([
            AudioPlayerLocations.ACTION_BAR,
            AudioPlayerActions.ADD_QUEUE_ITEM,
            meta?.path,
          ])
        }
      },
      modes: ['feed', 'seriesEpisode'],
      show: isMember && isAudioQueueAvailable && meta.audioSource?.mp3,
      group: 'audio',
    },
    {
      title: t('PodcastButtons/title'),
      Icon: IconPodcast,
      onClick: (e) => {
        e.preventDefault()
        trackEvent(['ActionBar', 'podcasts', meta.url])
        setPodcastOverlayVisible(!podcastOverlayVisible)
      },
      label: t('PodcastButtons/title'),
      show: !!podcast && meta.template !== 'format',
      modes: ['articleBottom'],
      group: mode === 'articleTop' ? 'audio' : undefined,
    },
  ]

  const shouldRenderActionItem = (actionItem) =>
    actionItem.show && actionItem.modes.includes(mode)

  const getGroup = (name) => (actionItem) =>
    !name ? !actionItem.group : actionItem.group === name

  const currentActionItems = ActionItems.filter(shouldRenderActionItem)

  // don't render actionbar if it has no items
  if (!currentActionItems.length) {
    return null
  }

  const primaryItems = currentActionItems.filter(getGroup())
  const secondaryItems = currentActionItems.filter(getGroup('secondary'))
  const audioItems = currentActionItems.filter(getGroup('audio'))

  return (
    <div
      {...(!isMember && mode !== 'articleOverlay' && styles.bottomMargin)}
      {...styles.hidePrint}
    >
      <div
        {...((mode === 'feed' || mode === 'seriesEpisode') && styles.flexWrap)}
        {...((mode === 'seriesEpisode' || mode === 'feed') &&
          styles.feedContainer)}
      >
        <div
          {...styles.topRow}
          {...(mode === 'articleOverlay' && styles.overlay)}
          {...((mode === 'seriesEpisode' || mode === 'feed') && styles.inline)}
          {...(mode === 'articleBottom' && styles.flexWrap)}
          {...(!!centered && { ...styles.centered })}
        >
          <RenderItems items={primaryItems} />
        </div>

        {!!secondaryItems.length && (
          <div
            {...styles.secondary}
            {...(!!centered && { ...styles.centered })}
          >
            <RenderItems items={secondaryItems} />
          </div>
        )}

        {!!audioItems.length && (
          <div
            {...(mode !== 'articleTop' ? styles.inline : styles.secondary)}
            {...(!!centered && { ...styles.centered })}
            style={
              mode === 'articleTop'
                ? { alignItems: 'center' }
                : mode === 'seriesEpisode'
                ? { marginRight: 24 }
                : {}
            }
          >
            <RenderItems items={audioItems} />
          </div>
        )}
      </div>

      {/* OVERLAYS */}
      {pdfOverlayVisible && (
        <PdfOverlay
          article={document}
          onClose={() => setPdfOverlayVisible(false)}
        />
      )}
      {fontSizeOverlayVisible && (
        <FontSizeOverlay onClose={() => setFontSizeOverlayVisible(false)} />
      )}
      {shareOverlayVisible && (
        <ShareOverlay
          onClose={() => setShareOverlayVisible(false)}
          url={shareUrl}
          title={t('article/actionbar/share')}
          emailSubject={emailSubject}
          emailBody={''}
          emailAttachUrl
        />
      )}
      {podcastOverlayVisible && (
        <PodcastOverlay
          onClose={() => setPodcastOverlayVisible(false)}
          title={t('PodcastButtons/title')}
          podcast={podcast}
        />
      )}
    </div>
  )
}

const styles = {
  bottomMargin: css({
    marginBottom: '16px',
  }),
  feedContainer: css({
    display: 'flex',
    justifyContent: 'space-between',
  }),
  topRow: css({
    display: 'flex',
  }),
  flexWrap: css({
    flexWrap: 'wrap',
    rowGap: 16,
  }),
  secondary: css({
    display: 'flex',
    marginTop: 24,
  }),
  overlay: css({
    marginTop: 0,
    width: '100%',
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
  }),
  inline: css({
    marginTop: 10,
    display: 'inline-flex',
  }),
  centered: css({
    justifyContent: 'center',
  }),
  shareTitle: css({
    margin: '16px 0 0 0',
  }),
  hidePrint: css({
    '@media print': {
      display: 'none',
    },
  }),
}

export default compose(withT)(ActionBar)
