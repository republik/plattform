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
import { ComponentType, ReactNode, Ref } from 'react'

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
    outline: 'inherit',
    textAlign: 'start',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    '&:disabled': {
      cursor: 'default',
    },
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
    padding: 8,
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

export type AudioListItemAction = {
  Icon: ComponentType
  label: string
  onClick: () => void | Promise<void>
}

type AudioListItemProps = {
  item: AudioQueueItem['document']
  isActive?: boolean
  onClick: (document: string) => Promise<void>
  beforeActionItem: ReactNode
  actions: AudioListItemAction[]
}

const AudioListItem = ({
  item,
  isActive,
  onClick,
  beforeActionItem,
  actions,
}: AudioListItemProps) => {
  const [colorScheme] = useColorContext()

  const { meta } = item
  const { audioSource } = meta
  const cover = imageResizeUrl(meta.image, '150x') || FALLBACK_IMG_SRC
  const publishDate = new Date(Date.parse(meta.publishDate))

  return (
    <div {...styles.root} {...colorScheme.set('backgroundColor', 'overlay')}>
      {beforeActionItem}
      <button
        {...styles.buttonFix}
        style={{ width: '100%' }}
        onClick={() => onClick(item.id)}
        disabled={isActive}
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
            {actions.map(({ Icon, label, onClick }) => (
              <IconButton
                key={label}
                label={label}
                labelShort={label}
                Icon={Icon}
                onClick={onClick}
              />
            ))}
          </div>
        </CalloutMenu>
      </div>
    </div>
  )
}

export default AudioListItem
