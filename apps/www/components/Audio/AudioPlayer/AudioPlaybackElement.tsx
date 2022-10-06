import { AudioPlayerProps } from '../AudioPlayerContainer'
import { useEffect } from 'react'
import { isDev } from '../../../lib/constants'

type AudioPlaybackElementProps = Pick<
  AudioPlayerProps,
  'activeItem' | 'autoPlay' | 'mediaRef'
> & {
  actions: Pick<
    AudioPlayerProps['actions'],
    'onPlay' | 'onPause' | 'onCanPlay' | 'onEnded' | 'onError'
  >
}

const AudioPlaybackElement = ({
  activeItem,
  actions,
  autoPlay,
  mediaRef,
}: AudioPlaybackElementProps) => {
  const {
    document: { meta: { audioSource } = {} },
  } = activeItem

  useEffect(() => {
    if (isDev && !activeItem?.document?.meta?.audioSource) {
      throw new Error(
        'AudioPlaybackElement: audioSource is missing in activeItem prop',
      )
    }
  }, [isDev, activeItem])

  return (
    <audio
      ref={mediaRef}
      preload={autoPlay ? 'auto' : 'metadata'}
      onPlay={actions.onPlay}
      onPause={actions.onPause}
      onCanPlay={actions.onCanPlay}
      onEnded={actions.onEnded}
      onError={actions.onError}
    >
      {audioSource.mp3 && <source src={audioSource.mp3} type='audio/mp3' />}
      {audioSource.aac && <source src={audioSource.aac} type='audio/aac' />}
      {audioSource.ogg && <source src={audioSource.ogg} type='audio/ogg' />}
    </audio>
  )
}

export default AudioPlaybackElement
