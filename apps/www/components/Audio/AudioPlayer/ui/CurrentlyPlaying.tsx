import { fontStyles, useColorContext } from '@project-r/styleguide'
import { IconDownload } from '@republik/icons'
import { css } from 'glamor'
import { dateFormatter, formatMinutes } from '../shared'
import AudioCover from './AudioCover'
import AudioPlayerTitle from './AudioPlayerTitle'
import AudioCalloutMenu from './tabs/shared/AudioCalloutMenu'
import { AudioQueueItem } from 'components/Audio/types/AudioPlayerItem'

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'row',
    gap: 16,
  }),
  detailWrapper: css({
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  }),
  metaWrapper: css({
    display: 'flex',
    flexDirection: 'row',
    gap: 12,
    ...fontStyles.sansSerifRegular12,
  }),
}

type CurrentlyPlayingProps = {
  item: AudioQueueItem
  t: any
  handleOpen: (path: string) => void
  handleDownload: (item: AudioQueueItem['document']) => Promise<void>
}

const CurrentlyPlaying = ({
  item,
  t,
  handleOpen,
  handleDownload,
}: CurrentlyPlayingProps) => {
  const [colorScheme] = useColorContext()

  const {
    document: {
      meta: {
        title,
        publishDate,
        audioSource,
        image,
        path,
        format,
        audioCoverCrop,
        coverMd,
      },
    },
  } = item
  const { durationMs } = audioSource
  return (
    <div>
      <div {...styles.root}>
        <AudioCover
          cover={coverMd}
          size={90}
          image={image}
          format={format?.meta}
          audioCoverCrop={audioCoverCrop}
          alt={title}
        />
        <div {...styles.detailWrapper}>
          {title && (
            <AudioPlayerTitle
              title={title}
              onClick={() => handleOpen(path)}
              lineClamp={3}
              fontSize={17}
            />
          )}

          <div {...styles.metaWrapper} {...colorScheme.set('color', 'text')}>
            <span>
              {publishDate && dateFormatter(new Date(Date.parse(publishDate)))}
            </span>
            <span>{formatMinutes(durationMs / 1000)}min</span>
            <span
              style={{
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                WebkitLineClamp: 1,
                wordBreak: 'break-all',
              }}
            >
              {item.document?.meta?.audioSource.kind === 'syntheticReadAloud' &&
                'synthetisch'}
            </span>
          </div>
        </div>
        <AudioCalloutMenu
          actions={[
            {
              Icon: IconDownload,
              label: t('AudioPlayer/Queue/Download'),
              onClick: () => handleDownload(item.document),
            },
          ]}
        />
      </div>
    </div>
  )
}

export default CurrentlyPlaying
