import { css } from 'glamor'
import compose from 'lodash/flowRight'

import withT from '../../lib/withT'

import {
  convertStyleToRem,
  fontStyles,
  mediaQueries,
  plainLinkRule,
  RawHtml,
} from '@project-r/styleguide'
import { useColorContext } from '@project-r/styleguide/src/components/Colors/ColorContext'

const styles = {
  audioInfo: css({
    textAlign: 'left',
    ...convertStyleToRem(fontStyles.sansSerifRegular14),
    [mediaQueries.mUp]: {
      ...convertStyleToRem(fontStyles.sansSerifRegular15),
    },
  }),
}

const AudioInfo = ({
  t,
  showAudioButtons,
  play,
  speakers = [],
  noReadAloud,
}) => {
  const [colorScheme] = useColorContext()
  const speaker = speakers.length
    ? speakers
        .map((s) =>
          s.user.id
            ? `<a href="/~${s.user.username || s.user.id}">${s.name}</a>`
            : s.name,
        )
        .join(', ')
    : t('article/actionbar/audio/info/speaker/default')
  return (
    <span
      {...styles.audioInfo}
      {...colorScheme.set('color', showAudioButtons ? 'text' : 'textSoft')}
    >
      {showAudioButtons ? (
        <RawHtml
          dangerouslySetInnerHTML={{
            __html: t('article/actionbar/audio/info/speaker', { speaker }),
          }}
        />
      ) : (
        <>
          <a
            {...plainLinkRule}
            style={{ textDecoration: 'underline' }}
            href='#'
            onClick={play('synthAudio')}
          >
            {t('article/actionbar/audio/info/play-synth')}
          </a>
          {!noReadAloud && (
            <>
              {' '}
              <span>{t('article/actionbar/audio/info/read-soon')}</span>
            </>
          )}
        </>
      )}
    </span>
  )
}

export default compose(withT)(AudioInfo)
