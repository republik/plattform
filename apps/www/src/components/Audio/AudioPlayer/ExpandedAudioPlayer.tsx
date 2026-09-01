import { trackEvent } from '@/app/lib/analytics/event-tracking'
import { useMe } from '@/lib/context/MeContext'
import { useUserAgent } from '@/lib/context/UserAgentContext'
import { useInNativeApp } from '@/lib/withInNativeApp'
import {
  fontStyles,
  IconButton,
  mediaQueries,
  Scroller,
  TabButton,
  useMediaQuery,
} from '@project-r/styleguide'
import { IconExpandMore } from '@republik/icons'
import { token } from '@republik/theme/tokens'
import { css } from 'glamor'
import { motion } from 'motion/react'
import React, { Dispatch, SetStateAction, useEffect, useMemo } from 'react'
import downloadAudioSourceFile from '../helpers/DownloadAudioSource'
import {
  AudioPlayerActions,
  AudioPlayerLocations,
} from '../types/AudioActionTracking'
import { AudioQueueItem } from '../types/AudioPlayerItem'
import AudioControl, { AudioControlProps } from './controls/AudioControl'
import { AudioPlayerProps } from './shared'
import AudioError from './ui/AudioError'
import CurrentlyPlaying from './ui/CurrentlyPlaying'
import LatestArticles from './ui/tabs/latest/LatestArticles'
import Queue from './ui/tabs/queue/Queue'

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
    borderColor: token.var('colors.divider'),
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
    color: token.var('colors.text'),
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
  const [activeTab, setActiveTab] = React.useState<'QUEUE' | 'LATEST'>('QUEUE')
  const { isAndroid } = useUserAgent()
  const { inNativeApp } = useInNativeApp()
  const isDesktop = useMediaQuery(mediaQueries.mUp)
  const { hasAccess, isMember } = useMe()

  // On Android we expect the back-button to close the expanded-player
  // and not the browser to navigate back.
  useEffect(() => {
    if (isDesktop || !isAndroid) {
      return
    }
    // FIXME: this does not actually prevent navigation if there is no state that was pushed before
    const handlePopState = (e) => {
      e.preventDefault()
      handleMinimize()
      return false
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [handleMinimize])

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
          backgroundColor: token.var('colors.hover'),
          borderRadius: 10,
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: token.var('colors.divider'),
          borderRadius: 10,
        },
      }),
    [],
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
        <p {...styles.heading}>
          {t(
            activeItem
              ? 'AudioPlayer/Queue/ActiveHeading'
              : 'AudioPlayer/Queue/NoActiveHeading',
          )}
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
        {isMember && (
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
              <span {...styles.tabBorder} />
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
        {!isMember && !activeItem && <p> {t('AudioPlayer/noMemberText')}</p>}
      </div>
    </div>
  )
}

export default ExpandedAudioPlayer
