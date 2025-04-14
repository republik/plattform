import Link from 'next/link'

import { useTranslation } from 'lib/withT'
import { usePathname } from 'next/navigation'

import { css } from '@republik/theme/css'

const Login = () => {
  const pathname = usePathname()
  const { t } = useTranslation()

  return (
    <p className={css({ textAlign: 'center' })}>
      {t.elements('regwall/login', {
        link: (
          <Link href={`/anmelden?redirect=${encodeURIComponent(pathname)}`}>
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
