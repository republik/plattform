import { css } from 'glamor'
import Link from 'next/link'
import { fontStyles, P, useColorContext } from '@project-r/styleguide'

import { intersperse } from '../../lib/utils/helpers'

const styles = {
  address: css({
    ...fontStyles.sansSerifRegular14,
    lineHeight: 1.4,
    '& a': {
      textDecoration: 'none',
      '@media (hover)': {
        ':hover': {
          textDecoration: 'underline',
        },
      },
    },
  }),
}

const Address = ({ t }) => {
  const [colorScheme] = useColorContext()
  return <>
    <P {...styles.address}>
      {t('footer/contact/name')}
      <br />
      {intersperse(t('footer/contact/address').split('\n'), (item, i) => (
        <br key={i} />
      ))}
    </P>
    <P {...styles.address}>
      <a
        {...colorScheme.set('color', 'text')}
        href={`mailto:${t('footer/contact/mail')}`}
      >
        {t('footer/contact/mail')}
      </a>
      <br />
      <Link prefetch={false} href='/impressum' {...colorScheme.set('color', 'text')}>
        {t('footer/media')}
      </Link>
    </P>
  </>;
}

export default Address
