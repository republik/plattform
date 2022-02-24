import React, { useContext } from 'react'
import { css } from 'glamor'
import {
  IconButton,
  useColorContext,
  PlayIcon,
  fontStyles,
  Editorial,
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

const HeadPhonesIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='21'
    height='15'
    viewBox='0 0 21 17'
    fill='inherit'
    style={{ marginRight: 4 }}
  >
    <path
      d='M6.92858 9.71429H6.32143C4.98003 9.71429 3.89286 10.8033 3.89286 12.1474V14.5669C3.89286 15.9106 4.98003 17 6.32143 17H6.92858C7.59909 17 8.14286 16.4551 8.14286 15.7834V10.9308C8.14286 10.2588 7.59909 9.71429 6.92858 9.71429ZM14.8214 9.71429H14.2143C13.5438 9.71429 13 10.2588 13 10.9308V15.7834C13 16.4551 13.5438 17 14.2143 17H14.8214C16.1628 17 17.25 15.9106 17.25 14.5669V12.1474C17.25 10.8037 16.1628 9.71429 14.8214 9.71429ZM10.5714 0C5.14168 0 1.03056 4.52056 0.857147 9.71429V13.9643C0.857147 14.2997 1.12884 14.5714 1.46429 14.5714H2.07143C2.40688 14.5714 2.67858 14.2997 2.67858 13.9643V9.71429C2.67858 5.36297 6.22012 1.82902 10.5714 1.82826C14.9228 1.82902 18.4643 5.36297 18.4643 9.71429V13.9643C18.4643 14.2997 18.736 14.5714 19.0714 14.5714H19.6786C20.014 14.5714 20.2857 14.2997 20.2857 13.9643V9.71429C20.1123 4.52056 16.0012 0 10.5714 0Z'
      fill='inherit'
    />
  </svg>
)

const SyntheticAudio = ({ meta }: { meta: Meta }) => {
  const { toggleAudioPlayer } = useContext<AudioContextType>(AudioContext)
  const [colorScheme] = useColorContext()

  return (
    <div>
      <hr {...styles.hr} {...colorScheme.set('backgroundColor', 'divider')} />
      <div {...styles.container}>
        <IconButton
          style={{ marginRight: 0 }}
          size={56}
          Icon={PlayIcon}
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
            <HeadPhonesIcon />
            Beitrag von synthetischen Stimme vorlesen lassen
          </p>
          <p {...styles.lead}>
            Ein Test, um die Republik zugänglicher zu machen.{' '}
            <Editorial.A>
              Wie schlecht finden Sie die Computerstimme?
            </Editorial.A>
          </p>
        </div>
      </div>

      <hr {...styles.hr} {...colorScheme.set('backgroundColor', 'divider')} />
    </div>
  )
}

export default SyntheticAudio
