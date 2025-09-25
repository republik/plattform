import AudioPlayerController from './AudioPlayerController'
import dynamic from 'next/dynamic'

const AudioPlayer = dynamic(() => import('./AudioPlayer/AudioPlayer'), {
  ssr: false,
})

const AudioPlayerOrchestrator = () => {
  return (
    <AudioPlayerController>
      {(props) => <AudioPlayer {...props} />}
    </AudioPlayerController>
  )
}

export default AudioPlayerOrchestrator
