import AudioPlayerController from './AudioPlayerController'
import dynamic from 'next/dynamic'
import useAudioQueue from './hooks/useAudioQueue'

const AudioPlayer = dynamic(() => import('./AudioPlayer/AudioPlayer'), {
  ssr: false,
})

const AudioPlayerOrchestrator = () => {
  const { isAudioQueueAvailable } = useAudioQueue()

  // In-app versions below 2.2.0 don't support the audio queue and no longer
  // get a player rendered at all.
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
