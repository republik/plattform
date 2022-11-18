import {
  PauseCircleIcon,
  PlayCircleIcon,
  plainButtonRule,
} from '@project-r/styleguide'

import useAudioQueue from '../Audio/hooks/useAudioQueue'
import { useAudioContext } from '../Audio/AudioProvider'
import { AudioPlayerLocations } from '../Audio/types/AudioActionTracking'

type FrontAudioPlayButtonProps = {
  documentId?: string
}

const FrontAudioPlayButton = ({ documentId }: FrontAudioPlayButtonProps) => {
  const {
    isPlaying,
    toggleAudioPlayback,
    toggleAudioPlayer,
    checkIfActivePlayerItem,
  } = useAudioContext()
  const { addAudioQueueItem } = useAudioQueue()

  if (!documentId) {
    return null
  }

  const isActivePlayerItem = checkIfActivePlayerItem(documentId)

  return (
    <button
      {...plainButtonRule}
      title='Beitrag hören'
      onClick={(e) => {
        e.stopPropagation()

        if (isActivePlayerItem) {
          toggleAudioPlayback()
        } else {
          addAudioQueueItem({ id: documentId }, 1).then(
            ({ data: { audioQueueItems } }) => {
              const item = audioQueueItems.find(
                (i) => i.document.id === documentId,
              )
              toggleAudioPlayer(item.document, AudioPlayerLocations.FRONT)
            },
          )
        }
      }}
    >
      {isActivePlayerItem ? (
        <>
          {isPlaying ? (
            <PauseCircleIcon size={36} />
          ) : (
            <PlayCircleIcon size={36} />
          )}
        </>
      ) : (
        <PlayCircleIcon size={36} />
      )}
    </button>
  )
}

export default FrontAudioPlayButton
