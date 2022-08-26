import { useContext } from 'react'
import { css } from 'glamor'
import {
  IconButton,
  useColorContext,
  AudioIcon,
  fontStyles,
  PodcastIcon,
  Editorial,
  AddIcon,
} from '@project-r/styleguide'

import { AudioContext } from '../Audio/AudioProvider'
import { trackEvent } from '../../lib/matomo'
import { useAddPlaylistItemMutation } from '../Audio/hooks/useAddPlaylistItemMutation'
import { usePlaylistQuery } from '../Audio/hooks/usePlaylistQuery'

type AudioSource = {
  kind: 'syntheticReadAloud' | 'readAloud'
  mp3?: string
  aac?: string
  ogg?: string
  mediaId: string
  durationMs: number
}

type Meta = {
  title: string
  path: string
  url: string
  audioSource: AudioSource
}

type AudioContextType = {
  toggleAudioPlayer: ({
    audioSource,
    title,
    path,
  }: {
    audioSource: AudioSource
    title: string
    path: string
  }) => void
}

const styles = {
  hr: css({
    margin: 0,
    display: 'block',
    border: 0,
    height: 1,
  }),
  container: css({
    display: 'flex',
    alignItems: 'flex-start',
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
  meta: Meta
  t: (sting) => string
}

const ReadAloudInline = ({ documentId, meta, t }: ReadAloudInlineProps) => {
  const { toggleAudioPlayer } = useContext<AudioContextType>(AudioContext)
  const [colorScheme] = useColorContext()

  const {
    data: playlistData,
    loading: playlistLoading,
    error: playlistError,
  } = usePlaylistQuery()
  const [addPlaylistItemMutation] = useAddPlaylistItemMutation()

  const playlist = playlistData?.me?.collectionPlaylist
  const alreadyInPlaylist =
    !playlistLoading &&
    !!playlistError &&
    playlist &&
    playlist.some(({ document: { id } }) => id === documentId)

  const handleAddToPlaylist = async () => {
    await addPlaylistItemMutation({
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
              audioSource: meta.audioSource,
              title: meta.title,
              path: meta.path,
            })
          }}
        />
        <IconButton
          Icon={AddIcon}
          onClick={handleAddToPlaylist}
          disalbed={alreadyInPlaylist}
          title={alreadyInPlaylist ? 'already in playlist' : 'add to playlist'}
        />
        <p {...styles.text}>
          <a
            href='#'
            onClick={(e) => {
              e.preventDefault()
              trackEvent([eventCategory, 'audio', meta.url])
              toggleAudioPlayer({
                audioSource: meta.audioSource,
                title: meta.title,
                path: meta.path,
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
