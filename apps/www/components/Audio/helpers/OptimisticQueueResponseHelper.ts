import { MoveAudioQueueItemMutation } from '#graphql/republik-api/__generated__/gql/graphql'
import { isDev } from '../../../lib/constants'
import { AudioQueueItem } from '../types/AudioPlayerItem'

const OptimisticQueueResponseHelper = {
  makeMoveQueueItemResponse: (
    queue: readonly AudioQueueItem[],
    movedItemId: string,
    newPosition: number,
  ):
    | {
        audioQueueItems: AudioQueueItem[]
      }
    | undefined => {
    const currentIndexOfMovedItem = queue.findIndex(
      (item) => item.id === movedItemId,
    )
    if (newPosition !== 1 || currentIndexOfMovedItem === -1) {
      if (isDev && newPosition !== 1) {
        console.warn(
          'Opttimistic queue response only implements moving to position 1',
        )
      }
      return undefined
    }

    const updatedQueue = [...queue].filter((item) => item.id !== movedItemId)
    const itemToMoveBefore = updatedQueue.find(
      (item, index) => item.sequence <= newPosition,
    )
    const nextIndex = updatedQueue.findIndex(
      (item) => item.id === itemToMoveBefore?.id,
    )

    updatedQueue.splice(nextIndex, 0, queue[currentIndexOfMovedItem])

    return {
      audioQueueItems: updatedQueue.map((item, index) => ({
        sequence: index + 1,
        ...item,
      })),
    }
  },
}

export default OptimisticQueueResponseHelper
