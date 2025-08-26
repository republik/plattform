import React, { Dispatch, SetStateAction, useEffect, useMemo } from 'react'
import { css } from 'glamor'
import { useRouter } from 'next/router'
import {
  IconButton,
  mediaQueries,
  useMediaQuery,
  Scroller,
  TabButton,
  useColorContext,
  fontStyles,
} from '@project-r/styleguide'
import { motion } from 'motion/react'
import { AudioPlayerProps } from './shared'
import CurrentlyPlaying from './ui/CurrentlyPlaying'
import Queue from './ui/tabs/queue/Queue'
import AudioControl, { AudioControlProps } from './controls/AudioControl'
import LatestArticles from './ui/tabs/latest/LatestArticles'
import AudioError from './ui/AudioError'
import { useUserAgent } from '../../../lib/context/UserAgentContext'
import { useMe } from '../../../lib/context/MeContext'
import { useInNativeApp } from '../../../lib/withInNativeApp'
import downloadAudioSourceFile from '../helpers/DownloadAudioSource'
import { trackEvent } from '@app/lib/analytics/event-tracking'
import {
  AudioPlayerLocations,
  AudioPlayerActions,
} from '../types/AudioActionTracking'
import { IconExpandMore } from '@republik/icons'
import { AudioQueueItem } from '../types/AudioPlayerItem'

const styles = {
  root: css({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    width: '100%',
    height: '100vh',
    paddingTop: 24,
    '& > *': {
      userSelect: 'none',
    },
    [mediaQueries.mUp]: {
      marginTop: 0,
      padding: 15,
      maxHeight: '100%',
      height: 'auto',
    },
    overflow: 'hidden',
  }),
  rootNoAccess: css({
    paddingBottom: 'calc(15px + env(safe-area-inset-bottom))',
  }),
  queueWrapper: css({
    flex: 1,
    minHeight: 0,
    display: 'inline-flex',
    flexDirection: 'column',
  }),
  queue: css({
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    scrollbarWidth: 'thin',
    // Hack to ensure scrollbar is within the padding of the overlay
    marginRight: ['-10px', 'calc(-1 * max(10px, env(safe-area-inset-right)))'],
    paddingRight: ['10px', 'max(10px, env(safe-area-inset-right))'],
    WebkitOverflowScrolling: 'touch',
    position: 'relative',
    [mediaQueries.mUp]: {
      minHeight: 282,
    },
  }),
  tabBorder: css({
    flexGrow: 1,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
  }),
  header: css({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  }),
  body: css({
    position: 'relative',
    overflowY: 'scroll',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  }),
  heading: css({
    ...fontStyles.sansSerifMedium16,
    lineHeight: '20px',
    marginBottom: 8,
    marginTop: 0,
  }),
  topWrapper: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  }),
  topSection: css({
    display: 'flex',
    gap: 24,
    flexDirection: 'column',
  }),
}

type ExpandedAudioPlayerProps = {
  handleMinimize: () => void
  handleClose: () => void
  handleOpenArticle: (path: string) => Promise<void>
  bodyLockTargetRef: React.Ref<HTMLDivElement>
  setForceScrollLock: Dispatch<SetStateAction<boolean>>
  isAutoPlayEnabled: boolean
  setAutoPlayEnabled: Dispatch<SetStateAction<boolean>>
} & AudioControlProps &
  Omit<AudioPlayerProps, 'actions'>

const ExpandedAudioPlayer = ({
  t,
  activeItem,
  queuedItems,
  currentTime = 0,
  duration = 0,
  playbackRate,
  isPlaying,
  isLoading,
  buffered,
  handleMinimize,
  handleToggle,
  handleSeek,
  handleForward,
  handleBackward,
  handlePlaybackRateChange,
  handleSkipToNext,
  handleOpenArticle,
  bodyLockTargetRef,
  setForceScrollLock,
  hasError,
  isAutoPlayEnabled,
  setAutoPlayEnabled,
}: ExpandedAudioPlayerProps) => {
  const [colorScheme] = useColorContext()
  const [activeTab, setActiveTab] = React.useState<'QUEUE' | 'LATEST'>('QUEUE')
  const { isAndroid } = useUserAgent()
  const { inNativeApp } = useInNativeApp()
  const isDesktop = useMediaQuery(mediaQueries.mUp)
  const router = useRouter()
  const { hasAccess } = useMe()

  // On Android we expect the back-button to close the expanded-player
  // and not the browser to navigate back.
  useEffect(() => {
    if (isDesktop || !isAndroid) {
      return
    }
    router.beforePopState(() => {
      handleMinimize()
      return false
    })

    return () => router.beforePopState(() => true)
  }, [router.beforePopState, handleMinimize])

  const handleDownload = async (item: AudioQueueItem['document']) => {
    try {
      downloadAudioSourceFile(item)
      trackEvent([
        AudioPlayerLocations.AUDIO_PLAYER,
        AudioPlayerActions.DOWNLOAD_TRACK,
        activeItem.document.meta?.path,
      ])
    } catch (err) {
      console.error(err)
    }
  }

  const queueScrollbarStyle = useMemo(
    () =>
      css({
        '&::-webkit-scrollbar': {
          height: 6,
          width: 6,
          backgroundColor: colorScheme.getCSSColor('hover'),
          borderRadius: 10,
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: colorScheme.getCSSColor('divider'),
          borderRadius: 10,
        },
      }),
    [colorScheme],
  )

  const nativeAppBodyStyle = useMemo(
    () =>
      inNativeApp
        ? css({
            [`@media (orientation: landscape)`]: {
              flexDirection: 'row',
              gap: 36,
              '> div': {
                flex: 1,
              },
            },
          })
        : css({}),
    [inNativeApp],
  )

  return (
    <div {...styles.root} {...(!hasAccess && styles.rootNoAccess)}>
      <div {...styles.header}>
        <p {...styles.heading} {...colorScheme.set('color', 'text')}>
          {t('AudioPlayer/Queue/ActiveHeading')}
        </p>
        <IconButton
          Icon={IconExpandMore}
          size={32}
          style={{ marginRight: 0, marginTop: -8 }}
          onClick={handleMinimize}
        />
      </div>
      <div {...styles.body} {...nativeAppBodyStyle}>
        {activeItem && (
          <div {...styles.topWrapper}>
            <div {...styles.topSection}>
              <CurrentlyPlaying
                t={t}
                item={activeItem}
                handleOpen={handleOpenArticle}
                handleDownload={handleDownload}
              />
            </div>
            <AudioControl
              handleToggle={handleToggle}
              handleSeek={handleSeek}
              handleForward={handleForward}
              handleBackward={handleBackward}
              handlePlaybackRateChange={handlePlaybackRateChange}
              handleSkipToNext={handleSkipToNext}
              isPlaying={isPlaying}
              isLoading={isLoading}
              playbackRate={playbackRate}
              currentTime={currentTime}
              duration={duration}
              buffered={buffered}
              isAutoPlayEnabled={isAutoPlayEnabled}
              setAutoPlayEnabled={setAutoPlayEnabled}
            />
            {hasError && <AudioError />}
          </div>
        )}
        {hasAccess && (
          <div {...styles.queueWrapper}>
            <Scroller>
              <TabButton
                text={t('AudioPlayer/Queue')}
                isActive={activeTab === 'QUEUE'}
                onClick={() => setActiveTab('QUEUE')}
              />
              <TabButton
                text={t('AudioPlayer/Latest')}
                isActive={activeTab === 'LATEST'}
                onClick={() => setActiveTab('LATEST')}
              />
              <span
                {...styles.tabBorder}
                {...colorScheme.set('borderColor', 'divider')}
              />
            </Scroller>
            <motion.div
              ref={bodyLockTargetRef}
              layoutScroll
              {...styles.queue}
              {...queueScrollbarStyle}
            >
              {activeTab === 'QUEUE' && (
                <Queue
                  t={t}
                  activeItem={activeItem}
                  items={queuedItems}
                  handleOpenArticle={handleOpenArticle}
                  handleDownload={handleDownload}
                  setForceScrollLock={setForceScrollLock}
                />
              )}
              {activeTab === 'LATEST' && (
                <LatestArticles
                  handleOpenArticle={handleOpenArticle}
                  handleDownload={handleDownload}
                />
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExpandedAudioPlayer
