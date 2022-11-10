import { css } from 'glamor'
import compose from 'lodash/flowRight'

import withT from '../../lib/withT'

import {
  convertStyleToRem,
  fontStyles,
  mediaQueries,
  plainButtonRule,
  Editorial,
  useColorContext,
} from '@project-r/styleguide'
import Link from 'next/link'
import { intersperse } from '../../lib/utils/helpers'

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
  willBeReadAloud,
}) => {
  const [colorScheme] = useColorContext()

  return (
    <span
      {...styles.audioInfo}
      {...colorScheme.set('color', showAudioButtons ? 'text' : 'textSoft')}
    >
      {showAudioButtons ? (
        <>
          {t('article/actionbar/audio/info/speaker') + ' '}
          {speakers?.length
            ? intersperse(
                speakers.map((s) =>
                  s.user?.slug ? (
                    <Link href={`/~${s.user.slug}`} passHref>
                      <Editorial.A>{s?.user?.name || s.name}</Editorial.A>
                    </Link>
                  ) : (
                    s.name
                  ),
                ),
                (_, i) => <span key={i}>, </span>,
              )
            : t('article/actionbar/audio/info/speaker/default')}
        </>
      ) : (
        <>
          <button
            {...plainButtonRule}
            style={{ textDecoration: 'underline' }}
            onClick={() => play()}
          >
            {t('article/actionbar/audio/info/play-synth')}
          </button>
          .
          {!!willBeReadAloud && (
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
