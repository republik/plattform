import { css } from 'glamor'
import QueueItem from './QueueItem'
import { AudioQueueItem } from '../../graphql/AudioQueueItemFragment'
import { fontStyles } from '@project-r/styleguide'
import useAudioQueue from '../../hooks/useAudioQueue'

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
  items: AudioQueueItem[]
}

const Queue = ({ items }: QueueProps) => {
  const { removeAudioQueueItem } = useAudioQueue()

  const handleRemove = async (item: AudioQueueItem, index: number) => {
    try {
      await removeAudioQueueItem({
        variables: {
          id: item.id,
          sequence: index,
        },
      })
    } catch (e) {
      console.error(e)
      alert('Could not remove item from playlist')
    }
  }

  return (
    <div>
      <p {...styles.heading}>Als Nächstes</p>
      <ul {...styles.list}>
        {items.map((item, index) => (
          <li key={item.id}>
            <QueueItem
              item={item}
              onRemove={(item) => handleRemove(item, index)}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Queue
