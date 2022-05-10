import compose from 'lodash/flowRight'
import { withRouter } from 'next/router'

import Frame from '../components/Frame'
import { useInNativeApp } from '../lib/withInNativeApp'
import SignInPage from './anmelden'
import Front from '../components/Front'
import Marketing from '../components/Marketing'
import withT from '../lib/withT'
import withMembership from '../components/Auth/withMembership'

import { PUBLIC_BASE_URL, CDN_FRONTEND_BASE_URL } from '../lib/constants'

import withDefaultSSR from '../lib/hocs/withDefaultSSR'

const IndexPage = ({ t, isMember, router }) => {
  const { inNativeIOSApp, isMinimalNativeAppVersion } = useInNativeApp()
  if (
    router.query.stale !== 'marketing' &&
    (isMember || router.query.extractId)
  ) {
    // does its own meta
    return (
      <Front
        shouldAutoRefetch
        hasOverviewNav
        extractId={router.query.extractId}
        finite
      />
    )
  }

  // only show marketing in ios app if it's the latest version
  if (inNativeIOSApp && !isMinimalNativeAppVersion('2.1.0')) {
    return <SignInPage />
  }

  const meta = {
    pageTitle: t('pages/index/pageTitle'),
    title: t('pages/index/title'),
    description: t('pages/index/description'),
    image: `${CDN_FRONTEND_BASE_URL}/static/social-media/logo.png`,
    url: `${PUBLIC_BASE_URL}/`,
  }
  return (
    <Frame raw meta={meta} isOnMarketingPage={true}>
      <Marketing />
    </Frame>
  )
}

const EnhancedPage = compose(withMembership, withT, withRouter)(IndexPage)

export default withDefaultSSR(EnhancedPage)
