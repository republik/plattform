import {
  fontStyles,
  useColorContext,
  CalloutMenu,
  MoreIcon,
  RemoveCircleIcon,
  IconButton,
  DragHandleIcon,
  LinkIcon,
  DownloadIcon,
} from '@project-r/styleguide'
import { Reorder, useDragControls, useMotionValue } from 'framer-motion'
import { css } from 'glamor'
import { dateFormatter, FALLBACK_IMG_SRC, formatMinutes } from '../shared'
import AudioPlayerTitle from './AudioPlayerTitle'
import { AudioQueueItem } from '../../graphql/AudioQueueHooks'
import { imageResizeUrl } from 'mdast-react-render/lib/utils'
import { Ref } from 'react'

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
  t: any
  item: AudioQueueItem
  onClick: (item: AudioQueueItem) => Promise<void>
  onRemove: (item: AudioQueueItem) => Promise<void>
  onDownload: (item: AudioQueueItem) => Promise<void>
  constraintRef?: Ref<any>
}

const QueueItem = ({
  t,
  item,
  onClick,
  onRemove,
  onDownload,
  constraintRef,
}: QueueItemProps) => {
  const controls = useDragControls()
  const y = useMotionValue(0)
  const [colorScheme] = useColorContext()

  const {
    document: { meta },
  } = item
  const { audioSource } = meta
  const cover = imageResizeUrl(meta.image, '150x') || FALLBACK_IMG_SRC
  const publishDate = new Date(Date.parse(meta.publishDate))

  return (
    <Reorder.Item
      key={item.id}
      value={item}
      dragControls={controls}
      dragConstraints={constraintRef}
      dragElastic={0.1}
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
            <AudioPlayerTitle title={meta.title} />
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
                Icon: RemoveCircleIcon,
                label: t('AudioPlayer/Queue/Remove'),
                onClick: () => onRemove(item),
              },
              {
                Icon: DownloadIcon,
                label: t('AudioPlayer/Queue/Download'),
                onClick: () => onDownload(item),
              },
              {
                Icon: LinkIcon,
                label: t('AudioPlayer/Queue/GoToItem'),
                href: meta.path,
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
