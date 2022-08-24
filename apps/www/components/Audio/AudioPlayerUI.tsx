import { useMemo } from 'react'
import { AudioPlayer, Loader } from '@project-r/styleguide'
import { AudioPlayerUIProps } from './AudioPlayerContainer'
import { useInNativeApp } from '../../lib/withInNativeApp'
import { useTranslation } from '../../lib/withT'
import BottomPanel from '../Frame/BottomPanel'

const AudioPlayerUI = ({
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
      <AudioPlayer
        t={t}
        title={audioState.title}
        sourcePath={audioState.sourcePath}
        isPlaying={isPlaying}
        isLoading={isLoading}
        currentTime={currentTime}
        duration={duration}
        actions={actions}
        buffered={buffered}
      />
      {playbackElement}
    </BottomPanel>
  )
}

export default AudioPlayerUI
