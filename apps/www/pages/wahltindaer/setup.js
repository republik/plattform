import { withRouter } from 'next/router'
import Head from 'next/head'

import Frame from '../../components/Frame'
import CardClaim from '../../components/Card/Claim'
import CardUpdate from '../../components/Card/Update'
import Meta from '../../components/Frame/Meta'

import withT from '../../lib/withT'
import { CDN_FRONTEND_BASE_URL } from '../../lib/constants'
import withDefaultSSR from '../../lib/hocs/withDefaultSSR'

const Page = ({ router, t }) => {
  const { token } = router.query

  if (token) {
    return (
      <Frame>
        <Meta
          data={{
            title: t('pages/cardSetup/title'),
            description: t('pages/cardSetup/description'),
            image: `${CDN_FRONTEND_BASE_URL}/static/social-media/republik-wahltindaer-09.png`,
          }}
        />
        <Head>
          <meta name='robots' content='noindex' />
        </Head>
        <CardClaim />
      </Frame>
    )
  }

  return (
    <Frame>
      <Meta
        data={{
          title: t('pages/cardSetup/title'),
          description: t('pages/cardSetup/description'),
        }}
      />
      <Head>
        <meta name='robots' content='noindex' />
      </Head>
      <CardUpdate />
    </Frame>
  )
}

export default withDefaultSSR(withRouter(withT(Page)))
