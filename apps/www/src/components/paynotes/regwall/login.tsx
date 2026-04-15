import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { css } from '@republik/theme/css'

import { useTrackEvent } from '@app/lib/analytics/event-tracking'

import { useTranslation } from 'lib/withT'

import { useMe } from 'lib/context/MeContext'

const Login = () => {
  const pathname = usePathname()
  const { me } = useMe()
  const { t } = useTranslation()
  const trackEvent = useTrackEvent()

  if (me) {
    return null
  }

  return (
    <p className={css({ textAlign: 'center' })}>
      {t.elements('regwall/login', {
        link: (
          <Link
            href={`/anmelden?redirect=${encodeURIComponent(pathname)}`}
            onClick={() => {
              trackEvent({ action: 'Clicked login link' })
            }}
          >
            <span
              className={css({
                textDecoration: 'underline',
                color: 'text.marketingAccent',
              })}
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
