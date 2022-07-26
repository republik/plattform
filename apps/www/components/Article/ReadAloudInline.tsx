import { useContext } from 'react'
import { css } from 'glamor'
import {
  IconButton,
  useColorContext,
  AudioIcon,
  fontStyles,
  mediaQueries,
  PodcastIcon,
  Editorial,
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
    justifyContent: 'space-between',
    padding: '12px 0',
    gap: 16,
  }),
  text: css({
    flex: 1,
    margin: 0,
  }),
  title: css({
    ...fontStyles.sansSerifMedium15,
    textDecoration: 'none',
    cursor: 'pointer',
    margin: '0px 0 4px 0',
    padding: 0,
  }),
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
      <div
        {...styles.container}
        {...css({
          alignItems: isSynthetic ? 'flex-start' : 'center',
          [mediaQueries.mUp]: {
            alignItems: 'center',
          },
        })}
      >
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
            {t(`article/${kind}/title`)}
          </a>{' '}
          {isSynthetic && (
            <Editorial.A href='/2022/05/04/helfen-sie-uns-die-synthetische-stimme-zu-verbessern/diskussion'>
              {t('article/syntheticReadAloud/errorLink')}
            </Editorial.A>
          )}
        </p>
      </div>
      <hr {...styles.hr} {...colorScheme.set('backgroundColor', 'divider')} />
    </div>
  )
}

export default SyntheticAudio
