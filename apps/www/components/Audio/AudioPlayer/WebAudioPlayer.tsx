import { useMemo, useState } from 'react'
import { AudioPlayerUIProps } from '../AudioPlayerContainer'
import { useInNativeApp } from '../../../lib/withInNativeApp'
import { useTranslation } from '../../../lib/withT'
import BottomPanel from '../../Frame/BottomPanel'
import ExpandedAudioPlayer from './ExpandedAudioPlayer'
import MiniAudioPlayer from './MiniAudioPlayer'

const WebAudioPlayer = ({
  mediaRef,
  audioState,
  autoPlay,
  currentTime,
  playbackRate,
  duration,
  isPlaying,
  isLoading,
  actions,
  buffered,
}: AudioPlayerUIProps) => {
  const { inNativeApp } = useInNativeApp()
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleAudioPlayer = () => {
    if (isPlaying) {
      actions.onPause()
    } else {
      actions.onPlay()
    }
  }

  const playbackElement = useMemo(() => {
    if (inNativeApp) return null

    return (
      <audio
        ref={mediaRef}
        preload={autoPlay ? 'auto' : 'metadata'}
        onPlay={actions.onPlay}
        onPause={actions.onPause}
        onCanPlay={actions.onCanPlay}
      >
        {audioState.audioSource.mp3 && (
          <source src={audioState.audioSource.mp3} type='audio/mp3' />
        )}
        {audioState.audioSource.aac && (
          <source src={audioState.audioSource.aac} type='audio/aac' />
        )}
        {audioState.audioSource.ogg && (
          <source src={audioState.audioSource.ogg} type='audio/ogg' />
        )}
      </audio>
    )
  }, [audioState, inNativeApp, autoPlay, mediaRef, actions])

  if (!audioState) return null

  return (
    <BottomPanel wide foreground={true} visible={true}>
      {isExpanded ? (
        <ExpandedAudioPlayer
          t={t}
          title={audioState.title}
          sourcePath={audioState.sourcePath}
          playbackRate={playbackRate}
          isPlaying={isPlaying}
          isLoading={isLoading}
          currentTime={currentTime}
          duration={duration}
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
          title={audioState.title}
          sourcePath={audioState.sourcePath}
          isPlaying={isPlaying}
          isLoading={isLoading}
          currentTime={currentTime}
          duration={duration}
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

export default WebAudioPlayer
