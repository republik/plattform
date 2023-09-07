import { css } from 'glamor'
import compose from 'lodash/flowRight'

import withT from '../../lib/withT'

import { fontStyles, Editorial, mediaQueries } from '@project-r/styleguide'
import Link from 'next/link'

const styles = {
  container: css({
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 5,
    ...fontStyles.sansSerif,
    fontSize: 11,
    lineHeight: '16px',
    color: 'var(--color-text)',
    [mediaQueries.mUp]: {
      fontSize: 14,
      lineHeight: '24px',
    },
  }),
  right: css({
    position: 'absolute',
    bottom: 0,
    right: 0,
    maxWidth: '60vw',
    textAlign: 'right',
  }),
  left: css({
    position: 'absolute',
    bottom: 0,
    left: 0,
    maxWidth: '40vw',
  }),
}

const Footer = ({ t, zIndex, imprint = true }) => {
  return (
    <div {...styles.container}>
      {imprint && (
        <div {...styles.left}>
          <Link href='/impressum' passHref>
            <Editorial.A>{t('footer/legal/imprint')}</Editorial.A>
          </Link>
        </div>
      )}
      <div {...styles.right}>
        <Editorial.A href='/wahltindaer/meta#das-republik-wahltindaer-im-detail'>
          {t('components/Card/Footer/sources')}
        </Editorial.A>
      </div>
    </div>
  )
}

export default compose(withT)(Footer)
