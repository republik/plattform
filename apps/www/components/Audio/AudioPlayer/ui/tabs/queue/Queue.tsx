import { css } from 'glamor'
import QueueItem from './QueueItem'
import useAudioQueue from '../../../../hooks/useAudioQueue'
import { AudioQueueItem } from '../../../../graphql/AudioQueueHooks'
import { useEffect, useState } from 'react'
import throttle from 'lodash/throttle'
import LoadingPlaceholder from '../shared/LoadingPlaceholder'
import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import {
  restrictToFirstScrollableAncestor,
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers'

const styles = {
  list: css({
    listStyle: 'none',
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    margin: '24px 0',
  }),
}

type QueueProps = {
  t: any
  activeItem: AudioQueueItem
  items: AudioQueueItem[]
  handleOpenArticle: (path: string) => Promise<void>
  handleDownload: (item: AudioQueueItem['document']) => Promise<void>
}

const Queue = ({
  t,
  activeItem,
  items: inputItems,
  handleOpenArticle,
  handleDownload,
}: QueueProps) => {
  const mouseSensor = useSensor(MouseSensor)
  const touchSensor = useSensor(TouchSensor)

  const sensors = useSensors(mouseSensor, touchSensor)

  /**
   * Work with a copy of the inputItems array to allow the mutation inside the
   * handleReorder function to be throttled while still having a smooth reordering in the ui.
   */
  const [items, setItems] = useState<AudioQueueItem[]>(inputItems)
  const {
    audioQueueIsLoading,
    moveAudioQueueItem,
    removeAudioQueueItem,
    reorderAudioQueue,
    checkIfActiveItem,
  } = useAudioQueue()

  /**
   * Synchronize the items passed via props with the internal items state.
   */
  useEffect(() => {
    setItems(inputItems)
  }, [inputItems])

  /**
   * Move the clicked queue-item to the front of the queue
   * @param item
   */
  const handleClick = async (item: AudioQueueItem) => {
    await moveAudioQueueItem({
      variables: {
        id: item.id,
        sequence: 1,
      },
    })
  }

  /**
   * Remove a given item from the queue
   * @param item
   */
  const handleRemove = async (item: AudioQueueItem) => {
    try {
      await removeAudioQueueItem({
        variables: {
          id: item.id,
        },
      })
    } catch (e) {
      console.error(e)
      console.log(
        'Could not remove item from playlist\n' + JSON.stringify(item, null, 2),
      )
    }
  }

  const handleReorder = throttle(async (items: AudioQueueItem[]) => {
    try {
      const reorderedQueue = [activeItem, ...items].filter(Boolean)

      await reorderAudioQueue({
        variables: {
          ids: reorderedQueue.map(({ id }) => id),
        },
        optimisticResponse: {
          audioQueueItems: reorderedQueue.map((item, index) => ({
            ...item,
            sequence: index + 1,
            __typename: 'AudioQueueItem',
          })),
        },
      })
    } catch (e) {
      console.error(e)
      console.log('Could not reorder queue')
    }
  }, 1000)

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const draggedIndex = active.data.current.sortable.index
    const draggedItem = items[draggedIndex]
    const overIndex = over?.data.current.sortable.index

    console.log('Moving item', draggedIndex, 'to', overIndex)
    const nextItems = [...items]
    nextItems.splice(draggedIndex, 1)
    nextItems.splice(overIndex, 0, draggedItem)
    console.log('Updated index', nextItems)

    setItems(nextItems)
    handleReorder(nextItems)
  }

  if (audioQueueIsLoading) {
    return <LoadingPlaceholder />
  }

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      modifiers={[
        restrictToVerticalAxis,
        restrictToWindowEdges,
        restrictToFirstScrollableAncestor,
      ]}
      sensors={sensors}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <ol {...styles.list}>
          {items.map((item) => (
            <QueueItem
              key={item.id}
              t={t}
              item={item}
              isActive={checkIfActiveItem(item.document.id)}
              onClick={handleClick}
              onRemove={handleRemove}
              onDownload={handleDownload}
              onOpen={handleOpenArticle}
            />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  )
}

export default Queue
