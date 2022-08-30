import { fontStyles, useColorContext } from '@project-r/styleguide'
import { css } from 'glamor'
import { AudioQueueItem } from '../../graphql/AudioQueueItemFragment'
import { dateFormatter, FALLBACK_IMG_SRC, formatMinutes } from '../shared'
import AudioPlayerTitle from './AudioPlayerTitle'

const styles = {
  root: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.5rem',
  }),
  cover: css({
    aspectRatio: '1 / 1',
    width: '3rem',
    objectFit: 'cover',
  }),
  itemWrapper: css({
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'row',
    gap: '0.5rem',
  }),
  dataWrapper: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  }),
  metaLine: css({
    ...fontStyles.sansSerifRegular12,
  }),
  actions: css({
    display: 'flex',
    transform: 'rotate(90deg)',
  }),
}

type QueueItemProps = {
  item: AudioQueueItem
  onRemove: (item: AudioQueueItem) => void
}

const QueueItem = ({ item, onRemove }: QueueItemProps) => {
  const [colorScheme] = useColorContext()

  const { document } = item
  const {
    meta: { audioSource },
  } = document
  const cover = document.meta.image || FALLBACK_IMG_SRC
  const publishDate = new Date(Date.parse(document.meta.publishDate))

  return (
    <div {...styles.root}>
      <div {...styles.itemWrapper}>
        <div>
          <img {...styles.cover} src={cover} />
        </div>
        <div {...styles.dataWrapper}>
          <AudioPlayerTitle
            title={document.meta.title}
            path={document.meta.path}
          />
          <span {...styles.metaLine} {...colorScheme.set('color', 'textSoft')}>
            {dateFormatter(publishDate)}
            {' - '}
            {formatMinutes(audioSource.durationMs / 1000)}min
          </span>
        </div>
      </div>
      <div {...styles.actions}>
        <button onClick={() => onRemove(item)}>remove</button>
      </div>
    </div>
  )
}

export default QueueItem
