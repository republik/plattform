import { useContext } from 'react'
import { css } from 'glamor'
import {
  IconButton,
  useColorContext,
  AudioIcon,
  fontStyles,
  mediaQueries,
} from '@project-r/styleguide'

import { AudioContext } from '../Audio/AudioProvider'
import { trackEvent } from '../../lib/matomo'

type AudioSource = {
  kind: 'syntheticReadAloud'
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
    margin: '0px 0 4px 0',
    padding: 0,
  }),
  lead: css({ ...fontStyles.sansSerifRegular15, margin: 0, padding: 0 }),
}

const SyntheticAudio = ({ meta, t }: { meta: Meta; t: (sting) => string }) => {
  const { toggleAudioPlayer } = useContext<AudioContextType>(AudioContext)
  const [colorScheme] = useColorContext()

  return (
    <div>
      <hr {...styles.hr} {...colorScheme.set('backgroundColor', 'divider')} />
      <div {...styles.container}>
        <IconButton
          style={{ marginRight: 0 }}
          size={56}
          Icon={AudioIcon}
          onClick={(e) => {
            e.preventDefault()
            trackEvent(['SyntheticAudio', 'audio', meta.url])
            toggleAudioPlayer({
              audioSource: meta.audioSource,
              title: meta.title,
              path: meta.path,
            })
          }}
        />
        <div {...styles.textContainer}>
          <p {...styles.title} {...colorScheme.set('fill', 'text')}>
            {t('article/syntheticreadaloud/title')}
            <span style={{ color: '#E9A733' }}> (Interner Test)</span>
          </p>
          <p {...styles.lead}>{t('article/syntheticreadaloud/lead')}</p>
        </div>
      </div>

      <hr {...styles.hr} {...colorScheme.set('backgroundColor', 'divider')} />
    </div>
  )
}

export default SyntheticAudio
