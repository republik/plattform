import { AudioQueueItemContent } from '@/app/(sanity)/groq/audio-queue-items-query'
import { AudioQueueItemProgress } from '@/components/Audio/types/AudioQueueItem'
import { fontStyles } from '@project-r/styleguide'
import { token } from '@republik/theme/tokens'
import { css } from 'glamor'
import { ReactNode } from 'react'
import { audioCoverStyle, dateFormatter, formatMinutes } from '../../../shared'
import { TeaserImage } from '@/app/(sanity)/components/teaser/_shared/teaser-image'
import AudioPlayerTitle from '../../AudioPlayerTitle'
import AudioCalloutMenu, { AudioListItemAction } from './AudioCalloutMenu'

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
    color: token.var('colors.textSoft'),
  }),
  actions: css({
    alignSelf: 'stretch',
    marginRight: 20,
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

type AudioListItemProps = {
  item: AudioQueueItemContent
  /** Listening position, when the item is one the queue tracks. */
  userProgress?: AudioQueueItemProgress | null
  isActive?: boolean
  onClick: () => Promise<void>
  beforeActionItem: ReactNode
  actions: AudioListItemAction[]
}

const AudioListItem = ({
  item,
  userProgress,
  isActive,
  onClick,
  beforeActionItem,
  actions,
}: AudioListItemProps) => {
  const durationSecs = (item.audioDurationMs ?? 0) / 1000
  const publishDate = new Date(Date.parse(item.publishDate))

  const durationString = formatMinutes(Math.max(durationSecs, 60))

  return (
    <div
      {...styles.root}
      style={{
        backgroundColor: token.var('colors.background.overlay'),
      }}
    >
      {beforeActionItem}
      <button {...styles.buttonFix} onClick={onClick} disabled={isActive}>
        <div {...styles.itemWrapper}>
          <TeaserImage
            image={item.image}
            width={62}
            height={62}
            alt=''
            fallback
            className={audioCoverStyle}
            style={{ width: 62, height: 62 }}
          />
          <div {...styles.dataWrapper}>
            <div {...styles.dataText}>
              <AudioPlayerTitle title={item.title} />
              <span {...styles.metaLine}>
                <span>{dateFormatter(publishDate)}</span>
                <span style={{ whiteSpace: 'nowrap' }}>
                  {durationString} min
                </span>
              </span>
            </div>
            {userProgress?.secs >= 10 && durationSecs > 0 && (
              <div
                style={{
                  width: '100%',
                  height: 2,
                  backgroundColor: token.var('colors.hover'),
                }}
              >
                <div
                  style={{
                    backgroundColor: token.var('colors.divider'),
                    position: 'relative',
                    width: `${(userProgress.secs / durationSecs) * 100}%`,
                    maxWidth: '100%',
                    height: 2,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </button>
      <div {...styles.actions}>
        <AudioCalloutMenu actions={actions} />
      </div>
    </div>
  )
}

export default AudioListItem
