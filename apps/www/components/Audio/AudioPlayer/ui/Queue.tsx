import { css } from 'glamor'
import QueueItem from './QueueItem'
import { PlaylistItemFragment } from '../../graphql/PlaylistItemGQLFragment'
import { fontStyles } from '@project-r/styleguide'

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
  items: PlaylistItemFragment[]
}

const Queue = ({ items }: QueueProps) => {
  return (
    <div>
      <p {...styles.heading}>Als Nächstes</p>
      <ul {...styles.list}>
        {items.map((item) => (
          <li key={item.id}>
            <QueueItem item={item} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Queue
