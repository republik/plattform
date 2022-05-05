import Frame from '../components/Frame'
import Marketing from '../components/Marketing'
import { useTranslation } from '../lib/withT'

import { PUBLIC_BASE_URL, CDN_FRONTEND_BASE_URL } from '../lib/constants'

import withDefaultSSR from '../lib/hocs/withDefaultSSR'
import { GetStaticProps } from 'next'
import createGetStaticProps from '../lib/helpers/createGetStaticProps'
import { MarketingPageQuery } from '../components/Marketing/graphql/MarketingPageQuery.graphql'

const MarketingPage = () => {
  const { t } = useTranslation()

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

export default MarketingPage

export const getStaticProps: GetStaticProps = createGetStaticProps(
  async (client, params) => {
    const data = await client.query({
      query: MarketingPageQuery,
    })
    return {
      props: {
        data,
      },
      revalidate: 60 * 5,
    }
  },
)
