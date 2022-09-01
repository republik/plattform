import {
  fontStyles,
  useColorContext,
  CalloutMenu,
  MoreIcon,
  RemoveIcon,
  IconButton,
} from '@project-r/styleguide'
import { Reorder, useMotionValue } from 'framer-motion'
import { css } from 'glamor'
import { dateFormatter, FALLBACK_IMG_SRC, formatMinutes } from '../shared'
import AudioPlayerTitle from './AudioPlayerTitle'
import { AudioQueueItem } from '../../graphql/AudioQueueHooks'

const styles = {
  root: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'move',
    '&:active': {
      cursor: 'grabbing',
    },
  }),
  buttonFix: css({
    color: 'inherit',
    border: 'none',
    padding: 0,
    font: 'inherit',
    cursor: 'pointer',
    outline: 'inherit',
    textAlign: 'start',
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
    alignSelf: 'stretch',
  }),
  menuWrapper: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
    '> *:not(:last-child)': {
      marginBottom: '15px',
    },
  }),
}

type QueueItemProps = {
  item: AudioQueueItem
  onClick: (item: AudioQueueItem) => Promise<void>
  onRemove: (item: AudioQueueItem) => Promise<void>
}

const QueueItem = ({ item, onClick, onRemove }: QueueItemProps) => {
  const y = useMotionValue(0)
  const [colorScheme] = useColorContext()

  const { document } = item
  const {
    meta: { audioSource },
  } = document
  const cover = document.meta.image || FALLBACK_IMG_SRC
  const publishDate = new Date(Date.parse(document.meta.publishDate))

  return (
    <Reorder.Item key={item.id} value={item} {...styles.root} style={{ y }}>
      <button
        {...styles.buttonFix}
        {...colorScheme.set('backgroundColor', 'default')}
        style={{ width: '100%' }}
        onDoubleClick={() => onClick(item)}
      >
        <div {...styles.itemWrapper}>
          <div>
            <img {...styles.cover} src={cover} />
          </div>
          <div {...styles.dataWrapper}>
            <AudioPlayerTitle title={document.meta.title} />
            <span
              {...styles.metaLine}
              {...colorScheme.set('color', 'textSoft')}
            >
              {dateFormatter(publishDate)}
              {' - '}
              {formatMinutes(audioSource.durationMs / 1000)}min
            </span>
          </div>
        </div>
      </button>
      <div {...styles.actions}>
        <CalloutMenu
          contentPaddingMobile={'30px'}
          Element={MoreIcon}
          align='right'
          elementProps={{
            ...colorScheme.set('fill', 'textSoft'),
            size: 20,
          }}
        >
          <div {...styles.menuWrapper}>
            <span style={{ fontSize: '0.5rem' }}>Debug: {item.sequence}</span>
            {[
              {
                Icon: RemoveIcon,
                label: 'Beitrag öffnen',
                href: document.meta.path,
              },
              {
                Icon: RemoveIcon,
                label: 'Entfernen',
                onClick: () => onRemove(item),
              },
            ].map(({ Icon, label, onClick, href }) => (
              <IconButton
                key={label}
                label={label}
                labelShort={label}
                Icon={Icon}
                href={href}
                onClick={onClick}
              />
            ))}
          </div>
        </CalloutMenu>
      </div>
    </Reorder.Item>
  )
}

export default QueueItem
