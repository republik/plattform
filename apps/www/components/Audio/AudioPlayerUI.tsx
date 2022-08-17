import { useInNativeApp } from '../../lib/withInNativeApp'
import { AudioPlayerUIProps } from './AudioPlayerContainer'

const AudioPlayerUI = ({
  audioRef,
  audioState,
  currentTime,
  playbackRate,
  duration,
  isPlaying,
  onPlay,
  onPause,
  onStop,
}: AudioPlayerUIProps) => {
  const { inNativeApp } = useInNativeApp()
  const totalState = {
    audioState,
    isPlaying,
    duration,
    currentTime,
    playbackRate,
  }

  const renderTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  if (!audioState) return null
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: '2rem 4rem',
        backgroundColor: '#e1e1e1',
      }}
    >
      <button onClick={() => onStop()}>Close</button>
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
      <div>
        {!inNativeApp && (
          <audio ref={audioRef} controls onPlay={onPlay} onPause={onPause}>
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
        <button onClick={onPlay} disabled={isPlaying}>
          Play
        </button>
        <button onClick={onPause} disabled={!isPlaying}>
          Pause
        </button>
      </div>
      <p>
        {renderTime(currentTime)} / {renderTime(duration)}
      </p>
    </div>
  )
}

export default AudioPlayerUI
