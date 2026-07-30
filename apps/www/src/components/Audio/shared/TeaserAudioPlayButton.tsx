import { plainButtonRule } from '@project-r/styleguide'

import useAudioQueue from '../hooks/useAudioQueue'
import { useAudioContext } from '../AudioProvider'
import { AudioPlayerLocations } from '../types/AudioActionTracking'
import { IconPauseCircle, IconPlayCircleOutline } from '@republik/icons'
import { useMutation } from '@apollo/client'
import {
  AddLegacyAudioQueueItemDocument,
  AudioQueueEntityType,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { rememberAudioItem } from '../helpers/audioItemCache'
import { useMe } from '@/lib/context/MeContext'

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
  const { isAudioQueueAvailable } = useAudioQueue()
  const { isMember } = useMe()
  // This button renders inside the legacy MDAST schema (front page / article
  // teasers), which only ever sees publikator documents and doesn't have the
  // item's meta loaded locally — unlike the rest of the player, it needs the
  // mutation reply itself to hydrate title/cover/mp3, so it goes straight to
  // the (still-supported) publikator-only mutation instead of through
  // `useAudioQueue`, which now assumes Sanity-capable refs with no document.
  const [addLegacyAudioQueueItem] = useMutation(AddLegacyAudioQueueItemDocument)

  if (!documentId) {
    return null
  }

  const isActivePlayerItem = checkIfActivePlayerItem(documentId)

  const isVisible = isAudioQueueAvailable && isMember

  return (
    <button
      style={{ visibility: isVisible ? 'visible' : 'hidden' }}
      {...plainButtonRule}
      title='Beitrag hören'
      onClick={(e) => {
        e.stopPropagation()
        if (!isVisible) return

        if (isActivePlayerItem) {
          toggleAudioPlayback()
        } else {
          addLegacyAudioQueueItem({
            variables: {
              entity: { id: documentId, type: AudioQueueEntityType.Document },
              sequence: 1,
            },
          }).then(({ data }) => {
            const item = data?.audioQueueItems.find(
              (i) => i.document?.id === documentId,
            )
            if (item?.document) {
              rememberAudioItem(documentId, item.document)
              toggleAudioPlayer(item.document, AudioPlayerLocations.FRONT)
            }
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
