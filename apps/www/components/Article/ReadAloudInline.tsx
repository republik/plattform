import { useContext } from 'react'
import { css } from 'glamor'
import {
  IconButton,
  useColorContext,
  AudioIcon,
  fontStyles,
  mediaQueries,
  RawHtml,
  PodcastIcon,
} from '@project-r/styleguide'

import { AudioContext } from '../Audio/AudioProvider'
import { trackEvent } from '../../lib/matomo'

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
    justifyContent: 'space-between',
    padding: '12px 0',
    gap: 16,
    [mediaQueries.mUp]: {
      alignItems: 'center',
    },
  }),
  textContainer: css({
    flex: 1,
  }),
  title: css({
    ...fontStyles.sansSerifMedium15,
    cursor: 'pointer',
    margin: '0px 0 4px 0',
    padding: 0,
  }),
  lead: css({ ...fontStyles.sansSerifRegular15, margin: 0, padding: 0 }),
}

const SyntheticAudio = ({ meta, t }: { meta: Meta; t: (sting) => string }) => {
  const { toggleAudioPlayer } = useContext<AudioContextType>(AudioContext)
  const [colorScheme] = useColorContext()
  const { kind } = meta.audioSource
  const isSynthetic = kind === 'syntheticReadAloud'
  const Icon = isSynthetic ? AudioIcon : PodcastIcon
  const eventCategory = isSynthetic ? 'SyntheticAudio' : 'ReadAloudAudio'
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
        <div {...styles.textContainer}>
          <p
            onClick={(e) => {
              e.preventDefault()
              trackEvent([eventCategory, 'audio', meta.url])
              toggleAudioPlayer({
                audioSource: meta.audioSource,
                title: meta.title,
                path: meta.path,
              })
            }}
            {...styles.title}
            {...colorScheme.set('fill', 'text')}
          >
            <RawHtml
              dangerouslySetInnerHTML={{
                __html: t(`article/${kind}/title`),
              }}
            />
          </p>
        </div>
      </div>

      <hr {...styles.hr} {...colorScheme.set('backgroundColor', 'divider')} />
    </div>
  )
}

export default SyntheticAudio
