import React, { Dispatch, SetStateAction } from 'react'
import { css } from 'glamor'
import {
  IconButton,
  ExpandMoreIcon,
  mediaQueries,
  Scroller,
  TabButton,
  useColorContext,
} from '@project-r/styleguide'
import { motion } from 'framer-motion'
import { AudioPlayerProps } from './shared'
import CurrentlyPlaying from './ui/CurrentlyPlaying'
import Queue from './ui/tabs/queue/Queue'
import AudioControl, { AudioControlProps } from './controls/AudioControl'
import LatestArticles from './ui/tabs/latest/LatestArticles'
import { AudioQueueItem } from '../graphql/AudioQueueHooks'
import { downloadFileFromUrl } from '../../../lib/helpers/FileDownloadHelper'
import AudioError from './ui/AudioError'
import { NEXT_PUBLIC_FEAT_HOERT_HOERT } from '../constants'

const styles = {
  root: css({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 16,
    width: '100%',
    height: '100vh',
    paddingTop: 15,
    '& > *': {
      userSelect: 'none',
    },
    [mediaQueries.mUp]: {
      marginTop: 0,
      padding: 15,
      maxHeight: '100%',
      height: 'auto',
    },
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
    marginLeft: ['-15px', 'calc(-1 * max(15px, env(safe-area-inset-left)))'],
    marginRight: ['-15px', 'calc(-1 * max(15px, env(safe-area-inset-right)))'],
    paddingLeft: ['15px', 'max(15px, env(safe-area-inset-left))'],
    paddingRight: ['15px', 'max(15px, env(safe-area-inset-right))'],
    [mediaQueries.mUp]: {
      height: 282,
      maxHeight: 282,
    },
  }),
  tabBorder: css({
    flexGrow: 1,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
  }),
  expandControl: css({
    position: 'absolute',
    top: 8,
    right: 0,
    [mediaQueries.mUp]: {
      top: 8,
      right: 8,
    },
  }),
  topSection: css({
    display: 'flex',
    gap: 24,
    flexDirection: 'column',
    // TODO: only apply on mobile
    // Media queries mDown not working here, because phone is larger in landscape than mobile-breakpoint
    [`@media (orientation: landscape) and ${mediaQueries.mDown}`]: {
      flexDirection: 'row',
      justifyContent: 'center',
      '> div': {
        flex: 1,
        alignSelf: 'flex-end',
      },
      '> div:last-child': {
        display: 'flex',
        gap: 16,
        flexDirection: 'column-reverse',
      },
    },
  }),
}

type ExpandedAudioPlayerProps = {
  handleMinimize: () => void
  handleClose: () => void
  handleOpenArticle: (path: string) => Promise<void>
  bodyLockTargetRef: React.RefObject<HTMLDivElement>
  setForceScrollLock: Dispatch<SetStateAction<boolean>>
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
}: ExpandedAudioPlayerProps) => {
  const [colorScheme] = useColorContext()
  const [activeTab, setActiveTab] = React.useState<'QUEUE' | 'LATEST'>('QUEUE')

  const handleDownload = async (item: AudioQueueItem) => {
    try {
      const {
        document: {
          meta: { audioSource, title },
        },
      } = item
      const downloadSource =
        audioSource.mp3 || audioSource.aac || audioSource.ogg
      const extension = downloadSource.split('.').pop()
      const serializedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
      const filename = `${serializedTitle}-republik.${extension}`

      await downloadFileFromUrl(downloadSource, filename)
    } catch (err) {
      // TODO: handle download error
      console.error(err)
    }
  }

  return (
    <div {...styles.root}>
      <div {...styles.expandControl}>
        <IconButton
          Icon={ExpandMoreIcon}
          size={32}
          style={{ marginRight: 0 }}
          onClick={handleMinimize}
        />
      </div>
      {activeItem && (
        <>
          <div {...styles.topSection}>
            <CurrentlyPlaying
              t={t}
              item={activeItem}
              handleOpen={handleOpenArticle}
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
          />
          {hasError && <AudioError />}
        </>
      )}
      {NEXT_PUBLIC_FEAT_HOERT_HOERT && (
        <div {...styles.queueWrapper}>
          <Scroller>
            <TabButton
              text={t('AudioPlayer/Queue', {
                count: queuedItems.length ? `(${queuedItems.length})` : '',
              })}
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
          <motion.div {...styles.queue} ref={bodyLockTargetRef} layoutScroll>
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
  )
}

export default ExpandedAudioPlayer
