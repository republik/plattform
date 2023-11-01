import { useEffect } from 'react'
import { useRouter } from 'next/router'

import SignIn from '../components/Auth/SignIn'
import Frame from '../components/Frame'
import Loader from '../components/Loader'
import { PageCenter } from '../components/Auth/withAuthorization'

import { useTranslation } from '../lib/withT'
import { withDefaultSSR } from '../lib/apollo/helpers'
import { useMe } from '../lib/context/MeContext'

const SigninPage = () => {
  const router = useRouter()
  const { query } = router
  const { me } = useMe()
  const { t } = useTranslation()
  useEffect(() => {
    if (me && query?.redirect) {
      // check if a successful login should redirect to a specific page
      const redirectTarget = decodeURIComponent(query.redirect)
      if (redirectTarget.startsWith('/')) {
        router.replace(redirectTarget)
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
