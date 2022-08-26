import { useMemo, useState } from 'react'
import { AudioPlayerProps } from '../AudioPlayerContainer'
import { useInNativeApp } from '../../../lib/withInNativeApp'
import { useTranslation } from '../../../lib/withT'
import BottomPanel from '../../Frame/BottomPanel'
import ExpandedAudioPlayer from './ExpandedAudioPlayer'
import MiniAudioPlayer from './MiniAudioPlayer'

// TODO: handle previously stored audio-player state
// this is detectable if the stored object has an audioSource element in the top
// level of the object
// easiest would be to clear the storage if this object was found (unless in legacy app)

const AudioPlayer = ({
  mediaRef,
  activePlayerItem,
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
  const { inNativeApp } = useInNativeApp()
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  const { meta: { audioSource, title, path } = {} } = activePlayerItem

  const toggleAudioPlayer = () => {
    if (isPlaying) {
      actions.onPause()
    } else {
      actions.onPlay()
    }
  }

  const playbackElement = useMemo(() => {
    if (inNativeApp || !audioSource) return null

    return (
      <audio
        ref={mediaRef}
        preload={autoPlay ? 'auto' : 'metadata'}
        onPlay={actions.onPlay}
        onPause={actions.onPause}
        onCanPlay={actions.onCanPlay}
      >
        {audioSource.mp3 && <source src={audioSource.mp3} type='audio/mp3' />}
        {audioSource.aac && <source src={audioSource.aac} type='audio/aac' />}
        {audioSource.ogg && <source src={audioSource.ogg} type='audio/ogg' />}
      </audio>
    )
  }, [audioSource, inNativeApp, autoPlay, mediaRef, actions])

  if (!activePlayerItem) return null

  return (
    <BottomPanel wide foreground={true} visible={true}>
      {isExpanded ? (
        <ExpandedAudioPlayer
          t={t}
          activePlayerItem={activePlayerItem}
          queue={queue}
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
        />
      ) : (
        <MiniAudioPlayer
          t={t}
          activePlayerItem={activePlayerItem}
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          isLoading={isLoading}
          buffered={buffered}
          handleExpand={() => setIsExpanded(true)}
          handleToggle={toggleAudioPlayer}
          handleSeek={actions.onSeek}
          handleClose={actions.onClose}
        />
      )}
      {playbackElement}
    </BottomPanel>
  )
}

export default AudioPlayer
