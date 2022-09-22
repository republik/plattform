import {
  fontStyles,
  useColorContext,
  CalloutMenu,
  MoreIcon,
  RemoveIcon,
  IconButton,
  DragHandleIcon,
} from '@project-r/styleguide'
import { Reorder, useDragControls, useMotionValue } from 'framer-motion'
import { css } from 'glamor'
import { dateFormatter, FALLBACK_IMG_SRC, formatMinutes } from '../shared'
import AudioPlayerTitle from './AudioPlayerTitle'
import { AudioQueueItem } from '../../graphql/AudioQueueHooks'
import { imageResizeUrl } from 'mdast-react-render/lib/utils'

const styles = {
  root: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.5rem',
  }),
  buttonFix: css({
    color: 'inherit',
    border: 'none',
    padding: 0,
    font: 'inherit',
    cursor: 'pointer',
    outline: 'inherit',
    textAlign: 'start',
    backgroundColor: 'transparent',
  }),
  cover: css({
    aspectRatio: '1 / 1',
    objectFit: 'cover',
    width: '3rem',
    height: 'auto',
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
  dragControl: css({
    marginRight: 8,
    cursor: 'grab',
    '&:hover': {
      cursor: 'grabbing',
    },
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
  const controls = useDragControls()
  const y = useMotionValue(0)
  const [colorScheme] = useColorContext()

  const { document } = item
  const {
    meta: { audioSource },
  } = document
  const cover = imageResizeUrl(document.meta.image, '150x') || FALLBACK_IMG_SRC
  const publishDate = new Date(Date.parse(document.meta.publishDate))

  return (
    <Reorder.Item
      key={item.id}
      value={item}
      dragControls={controls}
      dragListener={false}
      style={{ y, x: 0 }}
      {...styles.root}
      {...colorScheme.set('backgroundColor', 'overlay')}
    >
      <button
        {...styles.dragControl}
        {...styles.buttonFix}
        onPointerDown={(e) => controls.start(e)}
        onTouchStart={(e) => controls.start(e)}
      >
        <DragHandleIcon size={20} />
      </button>
      <button
        {...styles.buttonFix}
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
