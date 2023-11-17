import { useEffect } from 'react'
import { useRouter } from 'next/router'

import Frame from '../components/Frame'
import Marketing from '../components/Marketing'
import { useTranslation } from '../lib/withT'
import { createGetStaticProps } from '../lib/apollo/helpers'
import { getCMSClient } from '@app/lib/apollo/cms-client'
import { PUBLIC_BASE_URL, CDN_FRONTEND_BASE_URL } from '../lib/constants'
import { MARKETING_PAGE_CMS_QUERY } from '@app/graphql/cms/marketing-page.query'

import { MARKETING_PAGE_QUERY } from '../components/Marketing/graphql/MarketingPageQuery.graphql'
import { useMe } from '../lib/context/MeContext'

const MARKETING_PAGE_SSG_REVALIDATE = 60 // revalidate every minute

const MarketingPage = ({ data }) => {
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
      <Marketing data={data} />
    </Frame>
  )
}

export default MarketingPage

export const getStaticProps = createGetStaticProps(async (client) => {
  const apiData = await client.query({
    query: MARKETING_PAGE_QUERY,
  })
  const datoData = await getCMSClient().query({
    query: MARKETING_PAGE_CMS_QUERY,
  })
  return {
    props: {
      data: {
        ...apiData.data,
        ...datoData.data.marketingStartseite,
      },
    },
    revalidate: MARKETING_PAGE_SSG_REVALIDATE,
  }
})
