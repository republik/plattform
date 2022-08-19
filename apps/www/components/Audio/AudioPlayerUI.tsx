import { useInNativeApp } from '../../lib/withInNativeApp'
import { AudioPlayerUIProps } from './AudioPlayerContainer'

import { AudioPlayer, Loader } from '@project-r/styleguide'

const AudioPlayerUI = ({
  audioRef,
  audioState,
  currentTime,
  playbackRate,
  duration,
  isPlaying,
  isLoading,
  actions,
}: AudioPlayerUIProps) => {
  const { inNativeApp } = useInNativeApp()
  const totalState = {
    audioState,
    isPlaying,
    duration,
    currentTime,
    playbackRate,
  }

  if (!audioState) return null
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '.5rem',
        right: '.5rem',
        display: 'flex',
        flexDirection: 'column',
        padding: '2rem 4rem',
        backgroundColor: '#e1e1e1',
        border: '2px solid black',
        borderRadius: '0.5rem',
      }}
    >
      <button onClick={() => actions.onStop()}>Close</button>
      <div>
        <details style={{ maxWidth: '60vw', margin: '0 auto' }}>
          <summary>State passed to UI</summary>
          <pre
            style={{
              overflow: 'scroll',
            }}
          >
            {JSON.stringify(totalState, null, 2)}
          </pre>
        </details>
      </div>
      {isLoading && <Loader loading />}
      <div>
        {!inNativeApp && (
          <audio
            ref={audioRef}
            controls
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
        )}
      </div>
      <AudioPlayer
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        actions={actions}
      />
    </div>
  )
}

export default AudioPlayerUI
