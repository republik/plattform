import { useTranslation } from '@/lib/withT'
import {
  fontStyles,
  mediaQueries,
  plainButtonRule,
} from '@project-r/styleguide'
import { token } from '@republik/theme/tokens'
import { css } from 'glamor'

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
    ...fontStyles.sansSerifRegular12,
    [mediaQueries.mUp]: {
      ...fontStyles.sansSerifRegular15,
    },
    color: token.var('colors.error'),
  }),
  button: css({
    display: 'inline-block',
    textDecoration: 'underline',
  }),
}

const AudioError = () => {
  const { t } = useTranslation()

  return (
    <div {...styles.root}>
      <span>{t('AudioPlayer/error')}</span>
      <button
        {...plainButtonRule}
        {...styles.button}
        onClick={() => window.location.reload()}
      >
        {t('AudioPlayer/error/reload')}
      </button>
    </div>
  )
}

export default AudioError
