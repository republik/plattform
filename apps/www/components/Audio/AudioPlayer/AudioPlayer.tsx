import { useEffect, useState, useMemo } from 'react'
import { AudioPlayerProps } from '../AudioPlayerController'
import { useInNativeApp } from '../../../lib/withInNativeApp'
import { useTranslation } from '../../../lib/withT'
import { usePaynotes } from '../../../src/components/paynotes/paynotes-context'
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
import { AnimatePresence, motion } from 'motion/react'
import { css } from 'glamor'
import AudioPlaybackElement from './AudioPlaybackElement'
import { useUserAgent } from '../../../lib/context/UserAgentContext'
import { ZINDEX_POPOVER } from '../../constants'
import { AUDIO_PLAYER_WRAPPER_ID } from './constants'

const MARGIN = 15

// TODO: handle previously stored audio-player state
// this is detectable if the stored object has an audioSource element in the top
// level of the object
// easiest would be to clear the storage if this object was found (unless in legacy app)
const styles = {
  wrapper: css({
    position: 'fixed',
    zIndex: ZINDEX_POPOVER + 1,
    bottom: 0,
    right: 0,
    display: 'flex',
    boxShadow: '0px -5px 15px -3px rgba(0,0,0,0.1)',
  }),
  wrapperMini: css({
    marginRight: 'calc(15px + env(safe-area-inset-right))',
    marginLeft: 'calc(15px + env(safe-area-inset-left))',
    marginBottom: 'calc(15px + env(safe-area-inset-bottom))',
    width: ['290px', `calc(100% - ${MARGIN * 2}px)`],
    maxHeight: '100vh',
  }),
  wrapperExpanded: css({
    maxHeight: '100vh',
    height: [
      '100vh',
      '-moz-available',
      '-webkit-fill-available',
      'fill-available',
    ],
    margin: 0,
    paddingLeft: 'calc(15px + env(safe-area-inset-right))',
    paddingRight: 'calc(15px + env(safe-area-inset-left))',
    paddingBottom: 0,
    width: '100%',
  }),
}

const AudioPlayer = ({
  isVisible,
  isExpanded,
  setIsExpanded,
  setWebHandlers,
  activeItem,
  queue,
  currentTime,
  playbackRate,
  duration,
  isPlaying,
  isLoading,
  actions,
  buffered,
  hasError,
  isAutoPlayEnabled,
  setAutoPlayEnabled,
}: AudioPlayerProps) => {
  const { inNativeApp, inIOS } = useInNativeApp()
  const { isAndroid, isFirefox } = useUserAgent()
  const isDesktop = useMediaQuery(mediaQueries.mUp)
  const [forceScrollLock, setForceScrollLock] = useState(false)
  const [ref] = useBodyScrollLock<HTMLDivElement>(
    ((isExpanded && !isDesktop) || forceScrollLock) && !inNativeApp,
  )
  const { t } = useTranslation()
  const router = useRouter()
  const [colorScheme] = useColorContext()
  const [, ...queuedItems] = queue || [] // filter active-item from queue
  const { paynoteInlineHeight } = usePaynotes()

  // Desktop styles only apply to hover-capable devices (desktops/laptops)
  const desktopWrapperStyle = useMemo(
    () =>
      !inNativeApp
        ? css({
            [`${mediaQueries.mUp} and (hover: hover)`]: {
              right: 15,
              width: ['290px', `calc(100% - ${MARGIN * 2}px)`],
              maxWidth: 420,
              marginRight: MARGIN * 2,
              marginBottom: MARGIN * 2,
              padding: 0,
              maxHeight: ' min(720px, calc(100vh - 60px))',
            },
          })
        : css({}),
    [inNativeApp],
  )

  const desktopWrapperExpandedStyle = useMemo(
    () =>
      !inNativeApp
        ? css({
            [`${mediaQueries.mUp} and (hover: hover)`]: {
              height: 'auto',
              marginRight: 'calc(15px + env(safe-area-inset-right))',
              marginLeft: 'calc(15px + env(safe-area-inset-left))',
              marginBottom: 'calc(15px + env(safe-area-inset-bottom))',
              padding: 9,
            },
          })
        : css({}),
    [inNativeApp],
  )

  const toggleAudioPlayer = () => {
    if (isPlaying) {
      actions.onPause()
    } else {
      actions.onPlay()
    }
  }

  const handleOpenArticle = async (path: string) => {
    if ((inNativeApp || !isDesktop) && isExpanded) {
      setIsExpanded(false)
    }
    await router.push(path)
  }

  // Handle webkit in react-native-webview on iOS not resolving env(safe-area-inset-bottom).
  // See: https://github.com/react-native-webview/react-native-webview/issues/155
  const iOSSafeInsets = css({
    // iPhone 14
    ['@media only screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)']:
      {
        marginBottom: 49,
      },
    ['@media only screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)']:
      {
        marginBottom: 36,
      },
    // iPhone 13 mini, iPhone 12 mini, iPhone 11 Pro, iPhone Xs, and iPhone X
    ['@media only screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)']:
      {
        marginBottom: 34 + 15,
      },
    ['@media only screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)']:
      {
        marginBottom: 21 + 15,
      },
    // iPhone 11 and iPhone XR
    ['@media only screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)']:
      {
        marginBottom: 34 + 15,
      },
    ['@media only screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)']:
      {
        marginBottom: 21 + 15,
      },
  })

  // Mobile browser on android can't seem to handle fill-available
  // thus we must fallback to the following JS solution as described here:
  // Source: https://ilxanlar.medium.com/you-shouldnt-rely-on-css-100vh-and-here-s-why-1b4721e74487
  useEffect(() => {
    if (!isDesktop && !inNativeApp && isAndroid && isFirefox && isExpanded) {
      const calculateVh = () => {
        const vh = window.innerHeight * 0.01
        const wrapperElement = document.getElementById(AUDIO_PLAYER_WRAPPER_ID)
        wrapperElement?.style?.setProperty('--vh', vh + 'px')
      }

      // Initial calculation
      calculateVh()
      // Re-calculate on resize
      window.addEventListener('resize', calculateVh)
      // Re-calculate on device orientation change
      window.addEventListener('orientationchange', calculateVh)
      document
        .getElementById(AUDIO_PLAYER_WRAPPER_ID)
        ?.style?.setProperty('height', 'calc(var(--vh) * 100)')

      return () => {
        window.removeEventListener('resize', calculateVh)
        window.removeEventListener('orientationchange', calculateVh)
        document
          .getElementById(AUDIO_PLAYER_WRAPPER_ID)
          ?.style?.removeProperty('height')
      }
    }

    return
  }, [isDesktop, inNativeApp, isAndroid, isFirefox, isExpanded])

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <>
            <Backdrop
              isExpanded={isExpanded}
              onBackdropClick={() => setIsExpanded(false)}
            >
              <motion.div
                id={AUDIO_PLAYER_WRAPPER_ID}
                {...(inNativeApp && inIOS && !isExpanded && iOSSafeInsets)}
                ref={ref}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                {...styles.wrapper}
                {...desktopWrapperStyle}
                {...(isExpanded && desktopWrapperExpandedStyle)}
                {...(isExpanded ? styles.wrapperExpanded : styles.wrapperMini)}
                {...(inNativeApp && isExpanded
                  ? colorScheme.set('backgroundColor', 'default')
                  : colorScheme.set('backgroundColor', 'overlay'))}
                {...colorScheme.set('boxShadow', 'overlayShadow')}
                style={{
                  marginBottom:
                    paynoteInlineHeight !== 0
                      ? `calc(${
                          paynoteInlineHeight + MARGIN
                        }px + env(safe-area-inset-bottom))`
                      : undefined,
                  maxHeight:
                    isExpanded && paynoteInlineHeight !== 0
                      ? `calc(100vh - ${
                          paynoteInlineHeight + (inNativeApp ? 0 : 2 * MARGIN)
                        }px)`
                      : undefined,
                }}
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
                    setForceScrollLock={setForceScrollLock}
                    hasError={hasError}
                    isAutoPlayEnabled={isAutoPlayEnabled}
                    setAutoPlayEnabled={setAutoPlayEnabled}
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
                    hasError={hasError}
                  />
                )}
              </motion.div>
            </Backdrop>
          </>
        )}
      </AnimatePresence>
      {!inNativeApp && (
        <AudioPlaybackElement
          setWebHandlers={setWebHandlers}
          playbackRate={playbackRate}
          actions={actions}
        />
      )}
    </>
  )
}

export default AudioPlayer
