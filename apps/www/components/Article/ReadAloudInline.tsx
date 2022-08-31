import { css } from 'glamor'
import {
  IconButton,
  useColorContext,
  AudioIcon,
  fontStyles,
  PodcastIcon,
  Editorial,
  PlaylistAddIcon,
} from '@project-r/styleguide'

import { useAudioContext } from '../Audio/AudioProvider'
import { trackEvent } from '../../lib/matomo'
import { AudioPlayerItem } from '../Audio/types/AudioPlayerItem'
import useAudioQueue from '../Audio/hooks/useAudioQueue'

const styles = {
  hr: css({
    margin: 0,
    display: 'block',
    border: 0,
    height: 1,
  }),
  container: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '16px 0',
    gap: 16,
  }),
  text: css({
    flex: 1,
    margin: '2px 0',
  }),
  title: css({
    ...fontStyles.sansSerifMedium16,
    textDecoration: 'none',
  }),
  link: css({
    ...fontStyles.sansSerifRegular16,
    whiteSpace: 'nowrap',
  }),
}

type ReadAloudInlineProps = {
  documentId: string
  meta: AudioPlayerItem['meta'] & { url: string }
  t: (sting) => string
}

const ReadAloudInline = ({ documentId, meta, t }: ReadAloudInlineProps) => {
  const { toggleAudioPlayer } = useAudioContext()
  const [colorScheme] = useColorContext()

  const { audioQueue, checkIfInQueue } = useAudioQueue()
  const { addAudioQueueItem, isAudioQueueAvailable } = useAudioQueue()

  const handleAddToPlaylist = async () => {
    await addAudioQueueItem({
      variables: {
        entity: {
          id: documentId,
          type: 'Document',
        },
      },
    })
  }

  const { kind } = meta.audioSource
  const isSynthetic = kind === 'syntheticReadAloud'
  const Icon = (isSynthetic && AudioIcon) || PodcastIcon
  const eventCategory = (isSynthetic && 'SyntheticAudio') || 'ReadAloudAudio'
  const title = t(`article/${kind}/title`)
  const label = t(`article/${kind}/hint/label`)
  const link = t(`article/${kind}/hint/link`)

  return (
    <div>
      <hr {...styles.hr} {...colorScheme.set('backgroundColor', 'divider')} />
      <div {...styles.container}>
        <IconButton
          style={{ marginRight: 0 }}
          size={32}
          Icon={Icon}
          onClick={(e) => {
            e.preventDefault()
            trackEvent([eventCategory, 'audio', meta.url])
            toggleAudioPlayer({
              id: documentId,
              meta,
            })
          }}
        />
        {isAudioQueueAvailable && (
          <IconButton
            Icon={PlaylistAddIcon}
            onClick={handleAddToPlaylist}
            disalbed={checkIfInQueue(documentId)}
            title={
              checkIfInQueue(documentId)
                ? t('AudioPlayer/Queue/alreadyInQueue')
                : t('AudioPlayer/Queue/Add')
            }
          />
        )}
        <p {...styles.text}>
          <a
            href='#'
            onClick={(e) => {
              e.preventDefault()
              trackEvent([eventCategory, 'audio', meta.url])
              toggleAudioPlayer({
                id: documentId,
                meta,
              })
            }}
            {...colorScheme.set('color', 'text')}
            {...styles.title}
          >
            {title}
          </a>
          {label && link && (
            <>
              {' '}
              <Editorial.A href={link}>
                <span {...styles.link}>{label}</span>
              </Editorial.A>
            </>
          )}
        </p>
      </div>
      <hr {...styles.hr} {...colorScheme.set('backgroundColor', 'divider')} />
    </div>
  )
}

export default ReadAloudInline
