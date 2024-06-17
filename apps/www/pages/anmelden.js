import { useEffect } from 'react'
import { useRouter } from 'next/router'

import SignIn from '../components/Auth/SignIn'
import Frame from '../components/Frame'
import Loader from '../components/Loader'
import { PageCenter } from '../components/Auth/withAuthorization'

import { useTranslation } from '../lib/withT'
import { withDefaultSSR } from '../lib/apollo/helpers'
import { useMe } from '../lib/context/MeContext'

const allowedSignInRedirectHosts =
  process.env.NEXT_PUBLIC_ALLOWED_SIGNIN_REDIRECT_HOSTS?.split(',') || []

const SigninPage = () => {
  const router = useRouter()
  const { query } = router
  const { me } = useMe()
  const { t } = useTranslation()
  useEffect(() => {
    if (me && query?.redirect) {
      try {
        const redirectTarget = decodeURIComponent(query.redirect)
        const redirectUrl = new URL(redirectTarget, window.location.origin)

        if (
          redirectTarget.startsWith('/') &&
          redirectUrl.hostname === window.location.hostname
        ) {
          router.replace(redirectTarget)
          return
        }

        if (allowedSignInRedirectHosts.includes(redirectUrl.host)) {
          // redirect to the target URL using the browser's native redirect
          window.location.assign(redirectTarget)
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
  }, [me])

  const meta = {
    title: t('pages/signin/title'),
  }

  return (
    <Frame meta={meta}>
      <PageCenter>
        {me ? <Loader loading /> : <SignIn email={query.email} />}
      </PageCenter>
    </Frame>
  )
}

export default withDefaultSSR(SigninPage)
