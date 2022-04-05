import { useEffect } from 'react'
import { useRouter } from 'next/router'

import SignIn from '../components/Auth/SignIn'
import Frame from '../components/Frame'
import Loader from '../components/Loader'
import { PageCenter } from '../components/Auth/withAuthorization'

import { useTranslation } from '../lib/withT'
import withDefaultSSR from '../lib/hocs/withDefaultSSR'
import { useMe } from '../lib/context/MeContext'

const SigninPage = () => {
  const { query } = useRouter()
  const { me } = useMe()
  const { t } = useTranslation()
  useEffect(() => {
    if (me) {
      window.location = '/'
    }
  }, [me])

  const meta = {
    title: t('pages/signin/title'),
  }

  return (
    <Frame meta={meta}>
      <PageCenter>
        {me ? <Loader loading /> : <SignIn email={query.email} noReload />}
      </PageCenter>
    </Frame>
  )
}

export default withDefaultSSR(SigninPage)
