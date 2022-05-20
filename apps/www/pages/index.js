import { useEffect } from 'react'
import { useRouter } from 'next/router'

import Frame from '../components/Frame'
import Marketing from '../components/Marketing'
import { useTranslation } from '../lib/withT'

import { PUBLIC_BASE_URL, CDN_FRONTEND_BASE_URL } from '../lib/constants'

import createGetStaticProps from '../lib/helpers/createGetStaticProps'
import { MARKETING_PAGE_QUERY } from '../components/Marketing/graphql/MarketingPageQuery.graphql'
import { useMe } from '../lib/context/MeContext'
import { Loader } from '@project-r/styleguide'

const MARKETING_PAGE_SSG_REVALIDATE = 60 // revalidate every minute

const MarketingPage = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const { meLoading, hasAccess } = useMe()

  const { query, isReady } = router
  const isUserSync = query.syncUser === '1'

  useEffect(() => {
    if (!isReady || meLoading) {
      return
    }
    if (hasAccess) {
      window.location = '/'
    } else if (isUserSync) {
      router.replace(router.pathname, undefined, { shallow: true })
    }
  }, [router, isReady, meLoading, isUserSync, hasAccess])

  const meta = {
    pageTitle: t('pages/index/pageTitle'),
    title: t('pages/index/title'),
    description: t('pages/index/description'),
    image: `${CDN_FRONTEND_BASE_URL}/static/social-media/logo.png`,
    url: `${PUBLIC_BASE_URL}/`,
  }

  return (
    <Frame raw meta={meta} isOnMarketingPage={!isUserSync}>
      <Loader
        loading={isUserSync}
        style={{ minHeight: `calc(90vh)` }}
        render={() => <Marketing />}
      />
    </Frame>
  )
}

export default MarketingPage

export const getStaticProps = createGetStaticProps(async (client) => {
  const data = await client.query({
    query: MARKETING_PAGE_QUERY,
  })
  return {
    props: {
      data,
    },
    revalidate: MARKETING_PAGE_SSG_REVALIDATE,
  }
})
