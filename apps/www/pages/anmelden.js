import { Interaction } from '@project-r/styleguide'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import SignIn from '../components/Auth/SignIn'
import { PageCenter } from '../components/Auth/withAuthorization'
import Frame from '../components/Frame'
import Loader from '../components/Loader'
import { withDefaultSSR } from '../lib/apollo/helpers'
import { useMe } from '../lib/context/MeContext'

import { useTranslation } from '../lib/withT'

const allowedSignInRedirectOrigins =
  process.env.NEXT_PUBLIC_ALLOWED_SIGNIN_REDIRECT_ORIGINS?.split(',') || []

const SigninPage = () => {
  const router = useRouter()
  const { query } = router
  const { me } = useMe()
  const { t } = useTranslation()

  useEffect(() => {
    if (me && query?.redirect) {
      try {
        if (!me.onboarded) {
          router.replace('/onboarding/tipp-1')
          return
        }
        const redirectTarget = decodeURIComponent(query.redirect)
        const redirectUrl = new URL(redirectTarget, window.location.origin)

        if (
          redirectTarget.startsWith('/') &&
          redirectUrl.origin === window.location.origin
        ) {
          router.replace(redirectUrl)
          return
        }

        if (allowedSignInRedirectOrigins.includes(redirectUrl.origin)) {
          // redirect to the target URL using the browser's native redirect
          window.location.replace(redirectUrl)
          return
        }

        // ensure that the redirect target can only be a relative path
        throw new Error('Invalid redirect URL')
      } catch (e) {
        router.replace('/')
      }
    } else if (me) {
      router.replace('/')
    }
  }, [me, query.redirect, router])

  const meta = {
    title: t('pages/signin/title'),
  }

  return (
    <Frame meta={meta}>
      <PageCenter>
        {me ? (
          <Loader loading />
        ) : (
          <SignIn
            beforeForm={
              <>
                <Interaction.H1 style={{ marginBottom: 10 }}>
                  {t('pages/signin/title')}
                </Interaction.H1>
                <Interaction.P style={{ marginBottom: 20 }}>
                  {t('pages/signin/message')}
                </Interaction.P>
              </>
            }
            email={query.email}
          />
        )}
      </PageCenter>
    </Frame>
  )
}

export default withDefaultSSR(SigninPage)
