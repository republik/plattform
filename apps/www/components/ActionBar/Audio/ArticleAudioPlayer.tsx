import { useEffect, useState } from 'react'
import { useAudioContext } from '../../Audio/AudioProvider'
import { useMediaProgress } from '../../Audio/MediaProgress'
import { useGlobalAudioState } from '../../Audio/globalAudioState'
import useAudioQueue from '../../Audio/hooks/useAudioQueue'
import { AudioPlayerLocations } from '../../Audio/types/AudioActionTracking'
import { renderTime } from '../../Audio/AudioPlayer/shared'

type Props = {
  documentId: string
  documentMeta: any
}

export const ArticleAudioPlayer = ({ documentId, documentMeta }: Props) => {
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

  const isActiveAudioItem = checkIfActivePlayerItem(documentId)
  const itemPlaying = isPlaying && isActiveAudioItem
  const itemInAudioQueue = checkIfInQueue(documentId)
  const { getMediaProgress } = useMediaProgress()

  const [mediaProgress, setMediaProgress] = useState(0)

  const currentDisplayTime =
    isActiveAudioItem && currentTime > 0 ? currentTime : mediaProgress
  const duration = documentMeta.audioSource.durationMs / 1000

  useEffect(() => {
    const updateMediaProgress = async () => {
      const mp = await getMediaProgress({
        mediaId: documentMeta.audioSource.mediaId,
        durationMs: documentMeta.audioSource.durationMs,
      })
      setMediaProgress(mp || 0)
    }

    if (currentTime === 0) {
      updateMediaProgress()
    }
  }, [documentMeta.audioSource.mediaId, currentTime])

  const play = () => {
    toggleAudioPlayer(
      {
        id: documentId,
        meta: {
          title: documentMeta.title,
          path: documentMeta.path,
          publishDate: documentMeta.publishDate,
          image: documentMeta.image,
          audioSource: documentMeta.audioSource,
        },
      },
      AudioPlayerLocations.ACTION_BAR,
    )
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
      Plaing some shitz ({renderTime(currentDisplayTime)} /{' '}
      {renderTime(duration)})
    </div>
  )
}
