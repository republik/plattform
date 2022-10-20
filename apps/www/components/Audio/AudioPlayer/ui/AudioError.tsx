import React from 'react'
import { useRouter } from 'next/router'
import { css } from 'glamor'
import {
  plainButtonRule,
  fontStyles,
  mediaQueries,
  useColorContext,
} from '@project-r/styleguide'
import { useTranslation } from '../../../../lib/withT'

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
    ...fontStyles.sansSerifRegular12,
    [mediaQueries.mUp]: {
      ...fontStyles.sansSerifRegular15,
    },
  }),
  button: css({
    display: 'inline-block',
    textDecoration: 'underline',
  }),
}

const AudioError = () => {
  const { t } = useTranslation()
  const { reload } = useRouter()
  const [colorScheme] = useColorContext()

  return (
    <div {...styles.root} {...colorScheme.set('color', 'error')}>
      <span>{t('AudioPlayer/error')}</span>
      <button {...plainButtonRule} {...styles.button} onClick={() => reload()}>
        {t('AudioPlayer/error/reload')}
      </button>
    </div>
  )
}

export default AudioError
