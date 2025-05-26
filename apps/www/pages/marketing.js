import { useEffect } from 'react'
import { useRouter } from 'next/router'

import Frame from '../components/Frame'
import Marketing from '../components/Marketing'
import { useTranslation } from '../lib/withT'
import { createGetStaticProps } from '../lib/apollo/helpers'
import { getCMSClientBase } from '@app/lib/apollo/cms-client-base'
import { PUBLIC_BASE_URL, CDN_FRONTEND_BASE_URL } from '../lib/constants'

import { MARKETING_PAGE_QUERY } from '../components/Marketing/graphql/MarketingPageQuery.graphql'
import { useMe } from '../lib/context/MeContext'
import { MarketingLandingPageCmsDocument } from '#graphql/cms/__generated__/gql/graphql'

const MARKETING_PAGE_SSG_REVALIDATE = 60 // revalidate every minute

const MarketingPage = ({ data, draftMode }) => {
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
    <Frame
      raw
      meta={meta}
      isOnMarketingPage={true}
      hasOverviewNav
      draftMode={draftMode}
    >
      <Marketing data={data} />
    </Frame>
  )
}

export default MarketingPage

export const getStaticProps = createGetStaticProps(
  async (client, { draftMode }) => {
    const [apiData, datoCMSData] = await Promise.all([
      client.query({
        query: MARKETING_PAGE_QUERY,
      }),
      getCMSClientBase({ draftMode }).query({
        query: MarketingLandingPageCmsDocument,
      }),
    ])

    return {
      props: {
        data: {
          ...apiData.data,
          ...datoCMSData.data.marketingLandingPage,
          employees: datoCMSData.data.employees
        },
        draftMode: draftMode ?? false,
      },
      revalidate: MARKETING_PAGE_SSG_REVALIDATE,
    }
  },
)
