import { AudioQueueItem } from '@/components/Audio/types/AudioPlayerItem'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  IconDownload,
  IconDragHandle,
  IconLink,
  IconRemoveCircle,
} from '@republik/icons'
import { token } from '@republik/theme/tokens'
import { css } from 'glamor'
import AudioListItem from '../shared/AudioListItem'

const styles = {
  root: css({
    listStyle: 'none',
  }),
  buttonFix: css({
    border: 'none',
    padding: 0,
    font: 'inherit',
    outline: 'inherit',
    textAlign: 'start',
    backgroundColor: 'transparent',
    cursor: 'pointer',
  }),
  dragControl: css({
    color: token.var('colors.disabled'),
    padding: 0,
    cursor: 'grab',
    '&:hover': {
      cursor: 'grabbing',
    },
    alignSelf: 'stretch',
  }),
  dragging: css({
    zIndex: 110,
  }),
}

type QueueItemProps = {
  t: any
  item: AudioQueueItem
  isActive?: boolean
  onClick: (item: AudioQueueItem) => Promise<void>
  onRemove: (item: AudioQueueItem) => Promise<void>
  onDownload: (item: AudioQueueItem['document']) => Promise<void>
  onOpen: (path: string) => Promise<void>
}

const QueueItem = ({
  t,
  item,
  isActive,
  onClick,
  onRemove,
  onDownload,
  onOpen,
}: QueueItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  return (
    <li
      key={item.id}
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...styles.root}
      {...(isDragging ? styles.dragging : {})}
    >
      <AudioListItem
        item={item.document}
        isActive={isActive}
        onClick={() => onClick(item)}
        beforeActionItem={
          <button
            ref={setActivatorNodeRef}
            {...styles.dragControl}
            {...styles.buttonFix}
            {...css({
              '&:hover, &:active': {
                backgroundColor: token.var('colors.hover'),
              },
            })}
            {...attributes}
            {...listeners}
          >
            <IconDragHandle size={24} />
          </button>
        }
        actions={[
          {
            Icon: IconRemoveCircle,
            label: t('AudioPlayer/Queue/Remove'),
            onClick: () => onRemove(item),
          },
          {
            Icon: IconDownload,
            label: t('AudioPlayer/Queue/Download'),
            onClick: () => onDownload(item.document),
          },
          {
            Icon: IconLink,
            label: t('AudioPlayer/Queue/GoToItem'),
            onClick: () => onOpen(item.document.meta.path),
          },
        ]}
      />
    </li>
  )
}

export default QueueItem
