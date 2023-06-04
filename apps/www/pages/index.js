import { useEffect } from 'react'
import { useRouter } from 'next/router'

import Frame from '../components/Frame'
import Marketing from '../components/Marketing'
import { useTranslation } from '../lib/withT'
import { createGetStaticProps } from '../lib/apollo/helpers'

import { PUBLIC_BASE_URL, CDN_FRONTEND_BASE_URL } from '../lib/constants'

import { MARKETING_PAGE_QUERY } from '../components/Marketing/graphql/MarketingPageQuery.graphql'
import { useMe } from '../lib/context/MeContext'

const MARKETING_PAGE_SSG_REVALIDATE = 60 // revalidate every minute

const MarketingPage = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const { meLoading, hasAccess } = useMe()

  const { isReady } = router

  useEffect(() => {
    if (!isReady || meLoading) {
      return
    }
    if (hasAccess) {
      window.location = '/'
    }
  }, [router, isReady, meLoading, hasAccess])

  const meta = {
    pageTitle: t('pages/index/pageTitle'),
    title: t('pages/index/title'),
    description: t('pages/index/description'),
    image: `${CDN_FRONTEND_BASE_URL}/static/social-media/logo.png`,
    url: `${PUBLIC_BASE_URL}/`,
  }

  return (
    <Frame raw meta={meta} isOnMarketingPage={true} hasOverviewNav>
      <Marketing />
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
