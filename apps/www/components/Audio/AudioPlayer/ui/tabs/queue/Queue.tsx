import { css } from 'glamor'
import QueueItem from './QueueItem'
import EmptyQueue from './EmptyQueue'
import useAudioQueue from '../../../../hooks/useAudioQueue'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
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
import { useInNativeApp } from '../../../../../../lib/withInNativeApp'
import { useAudioContext } from '../../../../AudioProvider'
import {
  AudioPlayerLocations,
  AudioPlayerActions,
} from '../../../../types/AudioActionTracking'
import { trackEvent } from '@app/lib/analytics/event-tracking'
import { AudioQueueItem } from 'components/Audio/types/AudioPlayerItem'
import { IconButton } from '@project-r/styleguide'
import { IconRemoveCircle } from '@republik/icons'

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
  setForceScrollLock: Dispatch<SetStateAction<boolean>>
}

const Queue = ({
  t,
  activeItem,
  items: inputItems,
  handleOpenArticle,
  handleDownload,
  setForceScrollLock,
}: QueueProps) => {
  const { inNativeApp } = useInNativeApp()
  const mouseSensor = useSensor(MouseSensor)
  const touchSensor = useSensor(TouchSensor)

  const sensors = useSensors(mouseSensor, touchSensor)

  /**
   * Work with a copy of the inputItems array to allow the mutation inside the
   * handleReorder function to be throttled while still having a smooth reordering in the ui.
   */
  const [items, setItems] = useState<AudioQueueItem[]>(inputItems)
  const { toggleAudioPlayer, removeAudioQueueItem } = useAudioContext()
  const {
    audioQueueIsLoading,
    reorderAudioQueue,
    checkIfHeadOfQueue,
    clearAudioQueue,
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
    toggleAudioPlayer(item.document, AudioPlayerLocations.AUDIO_PLAYER)
  }

  /**
   * Remove a given item from the queue
   * @param item
   */
  const handleRemove = async (item: AudioQueueItem) => {
    try {
      await removeAudioQueueItem(item.id)
      trackEvent([
        AudioPlayerLocations.AUDIO_PLAYER,
        AudioPlayerActions.REMOVE_QUEUE_ITEM,
        item?.document?.meta?.path,
      ])
    } catch (e) {
      console.error(e)
    }
  }

  const handleReorder = throttle(async (items: AudioQueueItem[]) => {
    try {
      const reorderedQueue = [activeItem, ...items].filter(Boolean)
      await reorderAudioQueue(reorderedQueue)
    } catch (e) {
      console.error(e)
    }
  }, 1000)

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const draggedItemIndex = active.data.current.sortable.index
    const draggedItem = items[draggedItemIndex]
    const draggedOverIndex = over?.data.current.sortable.index

    // If the drag event is cancelled, the draggedOverIndex will be undefined.
    if (draggedOverIndex === undefined) {
      return
    }

    const nextItems = [...items]
    nextItems.splice(draggedItemIndex, 1)
    nextItems.splice(draggedOverIndex, 0, draggedItem)

    setItems(nextItems)
    handleReorder(nextItems)
  }

  if (audioQueueIsLoading) {
    return <LoadingPlaceholder />
  }

  if (!items || items.length === 0) {
    return <EmptyQueue t={t} />
  }

  return (
    <>
      <IconButton
        style={{
          margin: '24px 0',
        }}
        Icon={IconRemoveCircle}
        onClick={() => {
          if (
            window.confirm(
              'Ihre Wiedergabeliste wird gelöscht. Dieser Vorgang kann nicht rückgängig gemacht werden.',
            )
          ) {
            clearAudioQueue()
          }
        }}
        label={'Wiedergabeliste leeren'}
        labelShort={'Wiedergabeliste leeren'}
      />
      <DndContext
        onDragStart={() => {
          if (inNativeApp) {
            setForceScrollLock(true)
          }
        }}
        onDragEnd={(e) => {
          setForceScrollLock(false)
          handleDragEnd(e)
        }}
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
                isActive={!!checkIfHeadOfQueue(item.document.id)}
                onClick={handleClick}
                onRemove={handleRemove}
                onDownload={handleDownload}
                onOpen={handleOpenArticle}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
    </>
  )
}

export default Queue
