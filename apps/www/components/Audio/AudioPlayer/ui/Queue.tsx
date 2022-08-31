import { css } from 'glamor'
import QueueItem from './QueueItem'
import { fontStyles } from '@project-r/styleguide'
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
  const { removeAudioQueueItem } = useAudioQueue()

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

  return (
    <div>
      <p {...styles.heading}>{t('AudioPlayer/Queue/NextUp')}</p>
      <ul {...styles.list}>
        {items.map((item, index) => (
          <li key={item.id}>
            <QueueItem item={item} onRemove={handleRemove} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Queue
