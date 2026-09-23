'use client'
import AudioPlayerController from './AudioPlayerController'
import dynamic from 'next/dynamic'
import { useIsAudioQueueAvailable } from './hooks/useAudioQueue'

const AudioPlayer = dynamic(() => import('./AudioPlayer/AudioPlayer'), {
  ssr: false,
})

const AudioPlayerOrchestrator = () => {
  const isAudioQueueAvailable = useIsAudioQueueAvailable()

  // Unavailable only in a native app below v2.2.0, which plays audio in its
  // own player — the web side renders nothing and just posts `play-audio` to
  // it (see `AudioProvider.toggleAudioPlayer`).
  if (!isAudioQueueAvailable) {
    return null
  }

  return (
    <AudioPlayerController>
      {(props) => <AudioPlayer {...props} />}
    </AudioPlayerController>
  )
}

export default AudioPlayerOrchestrator
