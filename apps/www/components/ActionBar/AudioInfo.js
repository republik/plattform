import { css } from 'glamor'
import compose from 'lodash/flowRight'

import withT from '../../lib/withT'

import {
  convertStyleToRem,
  fontStyles,
  mediaQueries,
  plainLinkRule,
} from '@project-r/styleguide'
import { useColorContext } from '@project-r/styleguide/src/components/Colors/ColorContext'

const styles = {
  audioInfo: css({
    ...convertStyleToRem(fontStyles.sansSerifRegular14),
    [mediaQueries.mUp]: {
      ...convertStyleToRem(fontStyles.sansSerifRegular15),
    },
  }),
}

const AudioInfo = ({ t, showAudioButtons, play, noRead }) => {
  const [colorScheme] = useColorContext()
  return (
    <span
      {...styles.audioInfo}
      {...colorScheme.set('color', showAudioButtons ? 'text' : 'textSoft')}
    >
      {showAudioButtons ? (
        t('article/actionbar/audio/info/speaker')
      ) : (
        <>
          <a
            {...plainLinkRule}
            style={{ textDecoration: 'underline' }}
            href='#'
            onClick={play('synthAudio')}
          >
            {t('article/actionbar/audio/info/play-synth')}
          </a>{' '}
          {!noRead && (
            <span>{t('article/actionbar/audio/info/read-soon')}</span>
          )}
        </>
      )}
    </span>
  )
}

export default compose(withT)(AudioInfo)
