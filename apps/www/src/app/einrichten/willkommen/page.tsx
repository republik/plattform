// welcome page for the onboarding, only shown when extra context is necessary
// (e.g.: automatic redirect after sign-in)

import { Logo } from '@app/components/layout/header/logo'
import { getMe } from '@app/lib/auth/me'
import { css, cx } from '@republik/theme/css'
import { button } from '@republik/theme/recipes'
import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Willkommen!',
}

function Header() {
  return (
    <div
      className={css({
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: 'divider',
        p: 'header.logoMargin',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      })}
    >
      <Link href='/'>
        <Logo />
      </Link>
    </div>
  )
}

export default async function Page() {
  const { me } = await getMe()
  if (!me) {
    return redirect('/anmelden')
  }

  return (
    <div
      className={css({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      })}
    >
      <Header />
      <div
        className={css({
          mt: 16,
          px: 4,
          mx: 'auto',
          maxWidth: '400px',
          textAlign: 'center',
        })}
      >
        <h1
          className={css({
            fontFamily: 'gtAmericaStandard',
            fontWeight: 500,
            fontSize: '2xl',
            mb: 4,
          })}
        >
          Willkommen!
        </h1>
        <p>
          Wir haben noch <b>zwei Tipps für Sie,</b> um Ihnen zu helfen, das
          Beste aus Ihrem Abonnement herauszuholen.
        </p>
        <div className={css({ mt: 8, maxWidth: '280px', mx: 'auto' })}>
          <Link
            className={cx(button({ size: 'full' }), css({ mt: 2 }))}
            href='/einrichten'
          >
            {'Los gehts!'}
          </Link>
        </div>
      </div>
    </div>
  )
}
