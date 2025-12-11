import { useMemo } from 'react'
import { css } from 'glamor'
import { useTranslation } from '../../lib/withT'
import { useInNativeApp } from '../../lib/withInNativeApp'
import { mediaQueries, useColorContext } from '@project-r/styleguide'

import { HEADER_HEIGHT } from '../constants'
import Link from 'next/link'

const CallToAction = ({ formatColor }) => {
  const [colorScheme] = useColorContext()
  const { t } = useTranslation()
  const { inNativeApp } = useInNativeApp()
  const showTrialButton = inNativeApp

  const buttonColorRule = useMemo(() => {
    return css({
      color: colorScheme.getCSSColor('default'),
      backgroundColor: colorScheme.getCSSColor('text'),
      '@media (hover)': {
        ':hover': {
          color: colorScheme.getCSSColor('#FFF'),
          backgroundColor: colorScheme.getCSSColor(
            formatColor || 'primary',
            'format',
          ),
        },
      },
    })
  }, [colorScheme, formatColor])

  return showTrialButton ? (
    <Link
      href='#probelesen'
      data-hide-if-me='true'
      {...styles.button}
      {...(formatColor ? styles.buttonFormatColor : styles.buttonGeneric)}
      {...buttonColorRule}
    >
      <span>{t('marketing/preview/button/label')}</span>
    </Link>
  ) : (
    <Link
      href='/angebote'
      prefetch={false}
      data-hide-if-me='true'
      {...styles.button}
      {...(formatColor ? styles.buttonFormatColor : styles.buttonGeneric)}
      {...buttonColorRule}
    >
      <span {...styles.buttonTextMobile}>{t('cta/buttonsmall')}</span>
      <span {...styles.buttonText}>{t('cta/button')}</span>
    </Link>
  )
}

export default CallToAction

const styles = {
  button: css({
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    fontSize: 16,
    verticalAlign: 'middle',
    textAlign: 'center',
    textDecoration: 'none',
    lineHeight: 1.75,
    padding: '10px 20px',
    [mediaQueries.mUp]: {
      fontSize: 22,
    },
  }),
  buttonFormatColor: css({
    height: HEADER_HEIGHT,
    [mediaQueries.mUp]: {
      padding: '10px 30px',
    },
  }),
  buttonGeneric: css({
    height: HEADER_HEIGHT + 1,
    marginBottom: -1, // overlap HR line below button
    [mediaQueries.mUp]: {
      padding: '10px 30px',
    },
  }),
  buttonMarketing: css({
    height: HEADER_HEIGHT,
    [mediaQueries.mUp]: {
      padding: '10px 80px',
    },
  }),
  buttonText: css({
    display: 'none',
    [mediaQueries.mUp]: {
      display: 'inline',
    },
  }),
  buttonTextMobile: css({
    display: 'inline',
    [mediaQueries.mUp]: {
      display: 'none',
    },
  }),
}
