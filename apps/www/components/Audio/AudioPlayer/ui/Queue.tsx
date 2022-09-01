import { useRef, useState } from 'react'
import { css } from 'glamor'
import QueueItem from './QueueItem'
import { fontStyles, useColorContext } from '@project-r/styleguide'
import useAudioQueue from '../../hooks/useAudioQueue'
import { AudioQueueItem } from '../../graphql/AudioQueueHooks'

const styles = {
  heading: css({
    ...fontStyles.sansSerifMedium16,
  }),
  list: css({
    listStyle: 'none',
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  }),
}

type QueueProps = {
  t: any
  items: AudioQueueItem[]
}

const Queue = ({ t, items }: QueueProps) => {
  const [colorScheme] = useColorContext()
  const { moveAudioQueueItem, removeAudioQueueItem } = useAudioQueue()
  const draggedItem = useRef<AudioQueueItem>(null)
  const dragOverItem = useRef<AudioQueueItem>(null)
  const [dragging, setDragging] = useState<AudioQueueItem>(null)

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
      alert('Could not remove item from playlist')
    }
  }

  const handleDragStart = (item: AudioQueueItem) => {
    console.log('drag start', item)
    draggedItem.current = item
    setDragging(item)
  }

  const handleDragEnter = (item: AudioQueueItem) => {
    console.log('drag enter', item)
    dragOverItem.current = item
  }

  const handleDrop = (e) => {
    console.log('drop', e)
    console.log('dragged', draggedItem.current)
    console.log('dragOver', dragOverItem.current)
    console.log(
      `Moving: ${draggedItem.current.document.meta.title} -> ${dragOverItem.current.document.meta.title}`,
    )
    moveAudioQueueItem({
      variables: {
        id: draggedItem.current.id,
        sequence: dragOverItem.current.sequence,
      },
    }).then(() => {
      setDragging(null)
      draggedItem.current = null
      dragOverItem.current = null
    })
  }

  return (
    <div>
      <p {...styles.heading}>{t('AudioPlayer/Queue/NextUp')}</p>
      <ul {...styles.list}>
        {items.map((item) => (
          <li
            key={item.id}
            onDragStart={() => handleDragStart(item)}
            onDragEnter={() => handleDragEnter(item)}
            onDragEnd={handleDrop}
            draggable
            style={{
              opacity: dragging?.id === item.id ? 0.5 : 1,
            }}
            {...colorScheme.set('backgroundColor', 'default')}
          >
            <QueueItem
              item={item}
              onClick={handleClick}
              onRemove={handleRemove}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Queue
