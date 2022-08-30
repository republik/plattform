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
import { usePlaylistQuery } from '../Audio/hooks/usePlaylistQuery'
import { AudioPlayerItem } from '../Audio/types/AudioPlayerItem'
import usePlaylist from '../Audio/hooks/usePlaylist'

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

  const { playlist, playlistIsLoading, playlistHasError } = usePlaylist()
  const { addPlaylistItem, isPlaylistAvailable } = usePlaylist()

  const alreadyInPlaylist =
    !playlistIsLoading &&
    !!playlistHasError &&
    playlist &&
    playlist.some(({ document: { id } }) => id === documentId)

  const handleAddToPlaylist = async () => {
    await addPlaylistItem({
      variables: {
        item: {
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
        {isPlaylistAvailable && (
          <IconButton
            Icon={PlaylistAddIcon}
            onClick={handleAddToPlaylist}
            disalbed={alreadyInPlaylist}
            title={
              alreadyInPlaylist ? 'already in playlist' : 'add to playlist' // TODO: t9n
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
