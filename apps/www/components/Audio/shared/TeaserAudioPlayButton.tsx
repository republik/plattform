import { plainButtonRule } from '@project-r/styleguide'

import useAudioQueue from '../hooks/useAudioQueue'
import { useAudioContext } from '../AudioProvider'
import { AudioPlayerLocations } from '../types/AudioActionTracking'
import { IconPauseCircle, IconPlayCircleOutline } from '@republik/icons'
import { useFragment } from '#graphql/cms/__generated__/gql'
import { AudioQueueItemFragmentDoc } from '#graphql/republik-api/__generated__/gql/graphql'

type FrontAudioPlayButtonProps = {
  documentId?: string
}

/**
 * Play button that is passed to the front-schema which then renders
 * the individual play buttons for each article
 * @param documentId
 */
const TeaserAudioPlayButton = ({ documentId }: FrontAudioPlayButtonProps) => {
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
          addAudioQueueItem({ id: documentId } as never, 1).then(({ data }) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const audioQueueItems = useFragment(
              AudioQueueItemFragmentDoc,
              data.audioQueueItems,
            )
            const item = audioQueueItems.find(
              (i) => i.document.id === documentId,
            )
            toggleAudioPlayer(item.document, AudioPlayerLocations.FRONT)
          })
        }
      }}
    >
      {isActivePlayerItem ? (
        <>
          {isPlaying ? (
            <IconPauseCircle size={36} />
          ) : (
            <IconPlayCircleOutline size={36} />
          )}
        </>
      ) : (
        <IconPlayCircleOutline size={36} />
      )}
    </button>
  )
}

export default TeaserAudioPlayButton
