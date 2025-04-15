import Link from 'next/link'

import { useTranslation } from 'lib/withT'
import { usePathname } from 'next/navigation'

import { css } from '@republik/theme/css'
import { useMe } from 'lib/context/MeContext'

const Login = () => {
  const pathname = usePathname()
  const { me } = useMe()
  const { t } = useTranslation()

  if (me) {
    return null
  }

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
