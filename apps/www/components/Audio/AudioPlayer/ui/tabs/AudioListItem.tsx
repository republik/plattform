import {
  fontStyles,
  useColorContext,
  CalloutMenu,
  MoreIcon,
  IconButton,
} from '@project-r/styleguide'
import { Reorder, useDragControls, useMotionValue } from 'framer-motion'
import { css } from 'glamor'
import {
  dateFormatter,
  FALLBACK_IMG_SRC,
  formatMinutes,
  renderTime,
} from '../../shared'
import AudioPlayerTitle from '../AudioPlayerTitle'
import { AudioQueueItem } from '../../../graphql/AudioQueueHooks'
import { imageResizeUrl } from 'mdast-react-render/lib/utils'
import { ComponentType, ReactNode, Ref } from 'react'

const styles = {
  root: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  }),
  buttonFix: css({
    flex: 1,
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
    width: 62,
    height: 'auto',
  }),
  itemWrapper: css({
    display: 'flex',
    flexDirection: 'row',
    gap: 16,
  }),
  dataWrapper: css({
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'column',
  }),
  dataText: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  }),
  metaLine: css({
    ...fontStyles.sansSerifRegular,
    fontSize: 12,
    gap: 12,
    display: 'flex',
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
      <div {...styles.buttonFix}>
        <div {...styles.itemWrapper}>
          <img {...styles.cover} src={cover} />
          <div {...styles.dataWrapper}>
            <div {...styles.dataText}>
              <AudioPlayerTitle title={meta.title} />
              <span
                {...styles.metaLine}
                {...colorScheme.set('color', 'textSoft')}
              >
                <span>{dateFormatter(publishDate)}</span>
                <span style={{ whiteSpace: 'nowrap' }}>
                  {formatMinutes(audioSource.durationMs / 1000)} min
                </span>
                <span
                  style={{
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    WebkitLineClamp: 1,
                    wordBreak: 'break-all',
                  }}
                >
                  {item.meta.audioSource.kind === 'syntheticReadAloud' &&
                    'synthetisch'}
                </span>
              </span>
            </div>
            {audioSource.userProgress && audioSource.userProgress.secs >= 10 && (
              <div
                {...colorScheme.set('backgroundColor', 'hover')}
                style={{ width: '100%', height: 2 }}
              >
                <div
                  {...colorScheme.set('backgroundColor', 'divider')}
                  style={{
                    position: 'relative',
                    width: `${
                      (audioSource.userProgress.secs /
                        (audioSource.durationMs / 1000)) *
                      100
                    }%`,
                    height: 2,
                  }}
                ></div>
              </div>
            )}
          </div>
        </div>
      </div>
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
