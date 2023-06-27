import { fontStyles, useColorContext } from '@project-r/styleguide'
import { css } from 'glamor'
import { dateFormatter, formatMinutes } from '../../../shared'
import AudioPlayerTitle from '../../AudioPlayerTitle'
import AudioCover from '../../AudioCover'
import { AudioQueueItem } from '../../../../graphql/AudioQueueHooks'
import { useInNativeApp } from '../../../../../../lib/withInNativeApp'
import { ReactNode } from 'react'
import useMediaProgressQuery from '../../../../hooks/useMediaProgressQuery'
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
  const { inNativeApp } = useInNativeApp()

  const { meta } = item
  const { audioSource } = meta
  const publishDate = new Date(Date.parse(meta.publishDate))
  const { data: progress } = useMediaProgressQuery({
    variables: {
      mediaId: item?.meta?.audioSource?.mediaId,
    },
    skip: !item?.meta?.audioSource?.mediaId,
  })

  const durationString = formatMinutes(
    audioSource ? Math.max(audioSource.durationMs / 1000, 60) : 0,
  )

  return (
    <div
      {...styles.root}
      {...(inNativeApp
        ? colorScheme.set('backgroundColor', 'default')
        : colorScheme.set('backgroundColor', 'overlay'))}
    >
      {beforeActionItem}
      <button
        {...styles.buttonFix}
        onClick={() => onClick(item.id)}
        disabled={isActive}
      >
        <div {...styles.itemWrapper}>
          <AudioCover
            cover={meta.coverSm}
            size={62}
            image={meta.image}
            format={meta.format?.meta}
            audioCoverCrop={meta.audioCoverCrop}
            alt={meta?.title}
          />
          <div {...styles.dataWrapper}>
            <div {...styles.dataText}>
              <AudioPlayerTitle title={meta.title} />
              <span
                {...styles.metaLine}
                {...colorScheme.set('color', 'textSoft')}
              >
                <span>{dateFormatter(publishDate)}</span>
                <span style={{ whiteSpace: 'nowrap' }}>
                  {durationString} min
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
                  {item.meta?.audioSource?.kind === 'syntheticReadAloud' &&
                    'synthetisch'}
                </span>
              </span>
            </div>
            {progress?.mediaProgress && progress.mediaProgress?.secs >= 10 && (
              <div
                {...colorScheme.set('backgroundColor', 'hover')}
                style={{ width: '100%', height: 2 }}
              >
                <div
                  {...colorScheme.set('backgroundColor', 'divider')}
                  style={{
                    position: 'relative',
                    width: `${
                      (progress.mediaProgress.secs /
                        (audioSource.durationMs / 1000)) *
                      100
                    }%`,
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
