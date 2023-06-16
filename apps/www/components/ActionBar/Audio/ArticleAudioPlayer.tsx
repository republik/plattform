import { useEffect, useState } from 'react'
import { useAudioContext } from '../../Audio/AudioProvider'
import { useMediaProgress } from '../../Audio/MediaProgress'
import { useGlobalAudioState } from '../../Audio/globalAudioState'
import useAudioQueue from '../../Audio/hooks/useAudioQueue'
import { AudioPlayerLocations } from '../../Audio/types/AudioActionTracking'
import { renderTime } from '../../Audio/AudioPlayer/shared'
import Info from './Info'

type Props = {
  document: any
}

export const ArticleAudioPlayer = ({ document }: Props) => {
  const {
    toggleAudioPlayer,
    toggleAudioPlayback,
    addAudioQueueItem,
    removeAudioQueueItem,
    checkIfActivePlayerItem,
    isPlaying,
  } = useAudioContext()
  const { currentTime } = useGlobalAudioState()
  const { isAudioQueueAvailable, checkIfInQueue } = useAudioQueue()

  const isActiveAudioItem = checkIfActivePlayerItem(document.id)
  const itemPlaying = isPlaying && isActiveAudioItem
  const itemInAudioQueue = checkIfInQueue(document.id)
  const { getMediaProgress } = useMediaProgress()

  const [mediaProgress, setMediaProgress] = useState(0)

  const currentDisplayTime =
    isActiveAudioItem && currentTime > 0 ? currentTime : mediaProgress
  const duration = document.meta.audioSource.durationMs / 1000

  useEffect(() => {
    const updateMediaProgress = async () => {
      const mp = await getMediaProgress({
        mediaId: document.meta.audioSource.mediaId,
        durationMs: document.meta.audioSource.durationMs,
      })
      setMediaProgress(mp || 0)
    }

    if (currentTime === 0) {
      updateMediaProgress()
    }
  }, [document.meta.audioSource.mediaId, currentTime])

  const play = () => {
    toggleAudioPlayer(document, AudioPlayerLocations.ACTION_BAR)
  }

  return (
    <div style={{ padding: 20, background: '#ddd' }}>
      <button
        onClick={() => {
          if (isActiveAudioItem) {
            toggleAudioPlayback()
          } else {
            play()
          }
        }}
      >
        {itemPlaying ? 'Pause' : 'Play'}
      </button>
      <Info document={document} handlePlay={play} /> (
      {renderTime(currentDisplayTime)} / {renderTime(duration)})
      <button
        onClick={async (e) => {
          e.preventDefault()
          if (itemInAudioQueue) {
            await removeAudioQueueItem(itemInAudioQueue.id)
            //  trackEvent([
            //       AudioPlayerLocations.ACTION_BAR,
            //       AudioPlayerActions.REMOVE_QUEUE_ITEM,
            //       meta?.path,
            //     ])
          } else {
            await addAudioQueueItem(document)
            // trackEvent([
            //   AudioPlayerLocations.ACTION_BAR,
            //   AudioPlayerActions.ADD_QUEUE_ITEM,
            //   meta?.path,
            // ])
          }
        }}
      >
        {itemInAudioQueue ? 'X' : '+'}
      </button>
    </div>
  )
}
