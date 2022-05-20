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

  useEffect(() => {
    if (router.query.syncUser !== '1' || meLoading) {
      console.log(
        'xxx skip unsetting sync user',
        router.query.syncUser,
        meLoading,
      )
      return
    }
    alert('SETTING TIMEOUT')
    const timeout = setTimeout(() => {
      // Get rid of the sycnUser query param after 1.5sec
      console.log('xxx unsetting sync since meLoading is done')
      router.replace(router.asPath, null, { shallow: true })
    }, 10000)

    return () => clearTimeout(timeout)
  }, [router, meLoading, hasAccess])

  useEffect(() => {
    // eslint-disable-next-line no-constant-condition
    if (meLoading || router.query?.syncUser === '1' || true) {
      console.log(
        'xxx exiting page reload',
        meLoading,
        router.query?.syncUser === '1',
      )
      return
    }
    alert('RELOADING Logic')
    // reload the page to rewrite from '/' to '/front' via middleware
    if (hasAccess) {
      console.log('xxx reloading page')
      window.location.reload()
    }
  }, [meLoading, hasAccess, router.query])

  const meta = {
    pageTitle: t('pages/index/pageTitle'),
    title: t('pages/index/title'),
    description: t('pages/index/description'),
    image: `${CDN_FRONTEND_BASE_URL}/static/social-media/logo.png`,
    url: `${PUBLIC_BASE_URL}/`,
  }

  return (
    <Frame raw meta={meta} isOnMarketingPage={true}>
      <Loader
        loading={router.query?.syncUser === '1'}
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
