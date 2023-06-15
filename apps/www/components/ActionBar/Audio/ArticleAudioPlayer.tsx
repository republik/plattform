import { useAudioContext } from '../../Audio/AudioProvider'
import useAudioQueue from '../../Audio/hooks/useAudioQueue'
import { AudioPlayerLocations } from '../../Audio/types/AudioActionTracking'

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
  const { isAudioQueueAvailable, checkIfInQueue } = useAudioQueue()

  const isActiveAudioItem = checkIfActivePlayerItem(documentId)
  const itemPlaying = isPlaying && isActiveAudioItem
  const itemInAudioQueue = checkIfInQueue(documentId)

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
      Plaing some shitz
    </div>
  )
}
