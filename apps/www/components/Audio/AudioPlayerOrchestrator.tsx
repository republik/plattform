import AudioPlayerController from './AudioPlayerController'
import dynamic from 'next/dynamic'
import useAudioQueue from './hooks/useAudioQueue'
import { useAudioContext } from './AudioProvider'
import { useInNativeApp } from '../../lib/withInNativeApp'

const AudioPlayer = dynamic(() => import('./AudioPlayer/AudioPlayer'), {
  ssr: false,
})

const LegacyAudioPlayer = dynamic(
  () => import('./LegacyAudioPlayer/LegacyAudioPlayer'),
  {
    ssr: false,
  },
)

const AudioPlayerOrchestrator = () => {
  const { inNativeApp } = useInNativeApp()
  const { isAudioQueueAvailable } = useAudioQueue()
  const { audioPlayerVisible } = useAudioContext()

  // If the audio queue is available, we want to use the new audio player
  if (isAudioQueueAvailable) {
    return (
      <AudioPlayerController>
        {(props) => <AudioPlayer {...props} />}
      </AudioPlayerController>
    )
  } else if (!inNativeApp && audioPlayerVisible) {
    return <LegacyAudioPlayer />
  }

  // If inNativeApp and Version < 2.2.0 (isAudioQueueAvailable === false) then don't render anything
  return null
}

export default AudioPlayerOrchestrator
