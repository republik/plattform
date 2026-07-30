import { plainButtonRule } from '@project-r/styleguide'

import useAudioQueue from '../hooks/useAudioQueue'
import { useAudioContext } from '../AudioProvider'
import { AudioPlayerLocations } from '../types/AudioActionTracking'
import { IconPauseCircle, IconPlayCircleOutline } from '@republik/icons'
import { useMutation } from '@apollo/client'
import { getFragmentData } from '#graphql/cms/__generated__/gql'
import {
  AddAudioQueueItemsDocument,
  AudioQueueEntityType,
  AudioQueueItemFragmentDoc,
} from '#graphql/republik-api/__generated__/gql/graphql'
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
  // item's meta loaded locally — it needs the mutation reply itself to
  // hydrate title/cover/mp3, which the Sanity-capable queue (bare refs, no
  // document) can no longer provide. Goes straight to the publikator-only
  // mutation instead of through `useAudioQueue`.
  const [addAudioQueueItem] = useMutation(AddAudioQueueItemsDocument)

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
          addAudioQueueItem({
            variables: {
              entity: { id: documentId, type: AudioQueueEntityType.Document },
              sequence: 1,
            },
          }).then(({ data }) => {
            const audioQueueItems = getFragmentData(
              AudioQueueItemFragmentDoc,
              data?.audioQueueItems || [],
            )
            const item = audioQueueItems.find(
              (i) => i.document?.id === documentId,
            )
            if (item?.document) {
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
