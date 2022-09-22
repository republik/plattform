import { css } from 'glamor'
import { MotionConfig, Reorder } from 'framer-motion'
import QueueItem from './QueueItem'
import { fontStyles } from '@project-r/styleguide'
import useAudioQueue from '../../hooks/useAudioQueue'
import { AudioQueueItem } from '../../graphql/AudioQueueHooks'
import { useEffect, useRef, useState } from 'react'
import throttle from 'lodash/throttle'
import { downloadFileFromUrl } from '../../../../lib/helpers/FileDownloadHelper'

const styles = {
  heading: css({
    ...fontStyles.sansSerifMedium16,
  }),
  list: css({
    height: '100%',
    listStyle: 'none',
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    overflow: 'hidden',
    overflowY: 'auto',
    // TODO: custom scrollbar to better match the design
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  }),
}

type QueueProps = {
  t: any
  activeItem: AudioQueueItem
  items: AudioQueueItem[]
}

const Queue = ({ t, activeItem, items: inputItems }: QueueProps) => {
  /**
   * Work with a copy of the inputItems array to allow the mutation inside the
   * handleReorder function to be throttled while still having a smooth reordering in the ui.
   */
  const [items, setItems] = useState<AudioQueueItem[]>(inputItems)
  const ref = useRef()
  const { moveAudioQueueItem, removeAudioQueueItem, reorderAudioQueue } =
    useAudioQueue()

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
      alert(
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
      alert('Could not reorder playlist')
    }
  }, 1000)

  const handleDownload = async (item: AudioQueueItem) => {
    try {
      const {
        document: {
          meta: { audioSource, title },
        },
      } = item
      const downloadSource =
        audioSource.mp3 || audioSource.aac || audioSource.ogg
      const extension = downloadSource.split('.').pop()
      const serializedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
      const filename = `${serializedTitle}-republik.${extension}`

      await downloadFileFromUrl(downloadSource, filename)
    } catch (err) {
      // TODO: handle download error
      console.error(err)
      alert('Download failed: ' + err)
    }
  }

  return (
    <div style={{ flexGrow: 1, flexShrink: 1 }}>
      <p {...styles.heading}>
        {t('AudioPlayer/Queue', {
          count: items.length ? `(${items.length})` : null,
        })}
      </p>
      <MotionConfig transition={{ duration: 0.3 }}>
        <Reorder.Group
          as='ol'
          {...styles.list}
          axis='y'
          values={items}
          onReorder={(reorderedItems) => {
            setItems(reorderedItems)
            handleReorder(reorderedItems)
          }}
          ref={ref}
        >
          {items.map((item) => (
            <QueueItem
              key={item.id}
              t={t}
              item={item}
              onClick={handleClick}
              onRemove={handleRemove}
              onDownload={handleDownload}
              constraintRef={ref}
            />
          ))}
        </Reorder.Group>
      </MotionConfig>
    </div>
  )
}

export default Queue
