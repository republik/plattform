import { RefObject } from 'react'
import {
  RemoveCircleIcon,
  DragHandleIcon,
  LinkIcon,
  DownloadIcon,
} from '@project-r/styleguide'
import { Reorder, useDragControls, useMotionValue } from 'framer-motion'
import { css } from 'glamor'
import { AudioQueueItem } from '../../../graphql/AudioQueueHooks'
import AudioListItem from './AudioListItem'

const styles = {
  buttonFix: css({
    color: 'inherit',
    border: 'none',
    padding: 0,
    font: 'inherit',
    outline: 'inherit',
    textAlign: 'start',
    backgroundColor: 'transparent',
    cursor: 'pointer',
  }),
  dragControl: css({
    padding: 8,
    cursor: 'grab',
    '&:hover': {
      cursor: 'grabbing',
    },
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
  constraintRef?: RefObject<any>
}

const QueueItem = ({
  t,
  item,
  isActive,
  onClick,
  onRemove,
  onDownload,
  onOpen,
  constraintRef,
}: QueueItemProps) => {
  const controls = useDragControls()
  const y = useMotionValue(0)

  return (
    <Reorder.Item
      key={item.id}
      value={item}
      dragControls={controls}
      dragConstraints={constraintRef}
      dragElastic={0.1}
      dragListener={false}
      style={{ y, x: 0 }}
    >
      <AudioListItem
        item={item.document}
        isActive={isActive}
        onClick={() => onClick(item)}
        beforeActionItem={
          <button
            {...styles.dragControl}
            {...styles.buttonFix}
            onPointerDown={(e) => controls.start(e)}
            onTouchStart={(e) => controls.start(e)}
          >
            <DragHandleIcon size={20} />
          </button>
        }
        actions={[
          {
            Icon: RemoveCircleIcon,
            label: t('AudioPlayer/Queue/Remove'),
            onClick: () => onRemove(item),
          },
          {
            Icon: DownloadIcon,
            label: t('AudioPlayer/Queue/Download'),
            onClick: () => onDownload(item.document),
          },
          {
            Icon: LinkIcon,
            label: t('AudioPlayer/Queue/GoToItem'),
            onClick: () => onOpen(item.document.meta.path),
          },
        ]}
      />
    </Reorder.Item>
  )
}

export default QueueItem
