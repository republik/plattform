import { Offers } from '@app/components/paynotes/paynote/paynote-offers'
import { fontStyles, useColorContext } from '@project-r/styleguide'
import { css } from 'glamor'
import compose from 'lodash/flowRight'

import Link from 'next/link'
import withMe from '../../lib/apollo/withMe'
import { useTranslation } from '../../lib/withT'
import SignOut from '../Auth/SignOut'

const UserGuidance = ({ me }) => {
  const { t } = useTranslation()
  const [colorScheme] = useColorContext()

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <h3 {...styles.h3}>{t('UserGuidance/title')}</h3>
      <p {...styles.p}>
        {t.elements('UserGuidance/p1', { email: <strong>{me.email}</strong> })}
      </p>
      <Offers />
      <p {...styles.p} {...colorScheme.set('color', 'textSoft')}>
        {t.elements('UserGuidance/p2', {
          signout: (
            <SignOut style={{ textDecoration: 'underline' }} Link={Link}>
              {t('UserGuidance/signput')}
            </SignOut>
          ),
          support: (
            <Link
              style={{ textDecoration: 'underline' }}
              href='mailto:kontakt@republik.ch'
            >
              {t('faq/before/support/title')}
            </Link>
          ),
        })}
      </p>
    </div>
  )
}

const styles = {
  h3: css({
    ...fontStyles.sansSerifMedium22,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 24,
  }),
  p: css({
    ...fontStyles.sansSerifRegular14,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 24,
  }),
}

export default compose(withMe)(UserGuidance)
