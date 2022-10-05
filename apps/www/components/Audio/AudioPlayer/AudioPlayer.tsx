import { useState } from 'react'
import { AudioPlayerProps } from '../AudioPlayerContainer'
import { useInNativeApp } from '../../../lib/withInNativeApp'
import { useTranslation } from '../../../lib/withT'
import ExpandedAudioPlayer from './ExpandedAudioPlayer'
import MiniAudioPlayer from './MiniAudioPlayer'
import Backdrop from './ui/Backdrop'
import { useRouter } from 'next/router'
import {
  useMediaQuery,
  mediaQueries,
  useBodyScrollLock,
  useColorContext,
} from '@project-r/styleguide'
import { AnimatePresence, motion } from 'framer-motion'
import { css } from 'glamor'
import AudioPlaybackElement from './AudioPlaybackElement'
import { useAudioContext } from '../AudioProvider'

const MARGIN = 15

// TODO: handle previously stored audio-player state
// this is detectable if the stored object has an audioSource element in the top
// level of the object
// easiest would be to clear the storage if this object was found (unless in legacy app)
const styles = {
  wrapper: css({
    position: 'fixed',
    zIndex: 100,
    bottom: 0,
    right: 0,
    display: 'flex',
    boxShadow: '0px -5px 15px -3px rgba(0,0,0,0.1)',
    maxHeight: '100vh',
    [mediaQueries.mUp]: {
      width: ['290px', `calc(100% - ${MARGIN * 2}px)`],
      maxWidth: 420,
      marginRight: MARGIN * 2,
      marginBottom: MARGIN * 2,
      padding: 0,
      maxHeight: ' min(720px, calc(100vh - 60px))',
    },
  }),
  wrapperMini: css({
    marginRight: ['15px', 'max(15px, env(safe-area-inset-right))'],
    marginLeft: ['15px', 'max(15px, env(safe-area-inset-left))'],
    marginBottom: ['24px', 'max(24px, env(safe-area-inset-bottom))'],
    width: ['290px', `calc(100% - ${MARGIN * 2}px)`],
  }),
  wrapperExpanded: css({
    margin: 0,
    paddingLeft: ['15px', 'max(15px, env(safe-area-inset-left))'],
    paddingRight: ['15px', 'max(15px, env(safe-area-inset-right))'],
    paddingBottom: 0,
    width: '100%',
    [mediaQueries.mUp]: {
      marginRight: ['15px', 'max(15px, env(safe-area-inset-right))'],
      marginLeft: ['15px', 'max(15px, env(safe-area-inset-left))'],
      marginBottom: ['24px', 'max(24px, env(safe-area-inset-bottom))'],
    },
  }),
}

const AudioPlayer = ({
  isVisible,
  mediaRef,
  activeItem,
  queue,
  autoPlay,
  currentTime,
  playbackRate,
  duration,
  isPlaying,
  isLoading,
  actions,
  buffered,
}: AudioPlayerProps) => {
  const { audioPlayerContainerRef } = useAudioContext()
  const { inNativeApp } = useInNativeApp()
  const isDesktop = useMediaQuery(mediaQueries.mUp)
  const [isExpanded, setIsExpanded] = useState(false)
  const [ref] = useBodyScrollLock(isExpanded && !isDesktop)

  const { t } = useTranslation()
  const router = useRouter()
  const [colorScheme] = useColorContext()
  const [_, ...queuedItems] = queue || [] // filter active-item from queue

  const toggleAudioPlayer = () => {
    if (isPlaying) {
      actions.onPause()
    } else {
      actions.onPlay()
    }
  }

  const handleOpenArticle = async (path: string) => {
    console.log({ inNativeApp, path, isDesktop })
    if ((inNativeApp || !isDesktop) && isExpanded) {
      setIsExpanded(false)
    }
    await router.push(path)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <Backdrop
            isExpanded={isExpanded}
            onBackdropClick={() => setIsExpanded(false)}
          >
            <motion.div
              ref={ref}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              {...styles.wrapper}
              {...(isExpanded ? styles.wrapperExpanded : styles.wrapperMini)}
              {...colorScheme.set('backgroundColor', 'overlay')}
              {...colorScheme.set('boxShadow', 'overlayShadow')}
            >
              {isExpanded ? (
                <ExpandedAudioPlayer
                  t={t}
                  activeItem={activeItem}
                  queuedItems={queuedItems}
                  currentTime={currentTime}
                  duration={duration}
                  playbackRate={playbackRate}
                  isPlaying={isPlaying}
                  isLoading={isLoading}
                  buffered={buffered}
                  handleMinimize={() => setIsExpanded(false)}
                  handleToggle={toggleAudioPlayer}
                  handleSeek={actions.onSeek}
                  handleClose={actions.onClose}
                  handleForward={actions.onForward}
                  handleBackward={actions.onBackward}
                  handlePlaybackRateChange={actions.onPlaybackRateChange}
                  handleSkipToNext={actions.onSkipToNext}
                  handleOpenArticle={handleOpenArticle}
                  bodyLockTargetRef={ref}
                />
              ) : (
                <MiniAudioPlayer
                  t={t}
                  activeItem={activeItem}
                  currentTime={currentTime}
                  duration={duration}
                  isPlaying={isPlaying}
                  isLoading={isLoading}
                  buffered={buffered}
                  handleExpand={() => setIsExpanded(true)}
                  handleToggle={toggleAudioPlayer}
                  handleSeek={actions.onSeek}
                  handleClose={actions.onClose}
                  handleOpenArticle={handleOpenArticle}
                  containerRef={audioPlayerContainerRef}
                />
              )}
            </motion.div>
          </Backdrop>
          {activeItem && !inNativeApp && (
            <AudioPlaybackElement
              mediaRef={mediaRef}
              activeItem={activeItem}
              autoPlay={autoPlay}
              actions={actions}
            />
          )}
        </>
      )}
    </AnimatePresence>
  )
}

export default AudioPlayer
