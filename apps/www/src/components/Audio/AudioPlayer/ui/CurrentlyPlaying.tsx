import { AudioQueueItemContent } from '@/app/(sanity)/groq/audio-queue-items-query'
import { AudioQueueItem } from '@/components/Audio/types/AudioQueueItem'
import { fontStyles } from '@project-r/styleguide'
import { IconDownload } from '@republik/icons'
import { token } from '@republik/theme/tokens'
import { css } from 'glamor'
import { audioCoverStyle, dateFormatter, formatMinutes } from '../shared'
import { TeaserImage } from '@/app/(sanity)/components/teaser/_shared/teaser-image'
import AudioPlayerTitle from './AudioPlayerTitle'
import AudioCalloutMenu from './tabs/shared/AudioCalloutMenu'

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
    color: token.var('colors.text'),
  }),
}

type CurrentlyPlayingProps = {
  item: AudioQueueItem
  t: any
  handleOpen: (path: string) => void
  handleDownload: (item: AudioQueueItemContent) => Promise<void>
}

const CurrentlyPlaying = ({
  item,
  t,
  handleOpen,
  handleDownload,
}: CurrentlyPlayingProps) => {
  const { title, publishDate, slug, image, audioDurationMs } = item.document
  return (
    <div>
      <div {...styles.root}>
        <TeaserImage
          image={image}
          width={90}
          height={90}
          alt=''
          fallback
          className={audioCoverStyle}
          style={{ width: 90, height: 90 }}
        />
        <div {...styles.detailWrapper}>
          {title && (
            <AudioPlayerTitle
              title={title}
              onClick={() => handleOpen(slug)}
              lineClamp={3}
              fontSize={17}
            />
          )}

          <div {...styles.metaWrapper}>
            <span>
              {publishDate && dateFormatter(new Date(Date.parse(publishDate)))}
            </span>
            <span>{formatMinutes((audioDurationMs ?? 0) / 1000)}min</span>
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
