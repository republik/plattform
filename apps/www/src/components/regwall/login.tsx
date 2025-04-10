import { css } from '@republik/theme/css'
import { useTranslation } from 'lib/withT'
import Link from 'next/link'

const Login = () => {
  const { t } = useTranslation()
  return (
    <p className={css({ textAlign: 'center' })}>
      {t.elements('regwall/login', {
        link: (
          <Link href='/anmelden'>
            <span
              className={css({ textDecoration: 'underline', color: '#FF6969' })}
            >
              {t('regwall/login/link')}
            </span>
          </Link>
        ),
      })}
    </p>
  )
}

export default Login
