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

  const isUserSync = router.query?.syncUser === '1'

  useEffect(() => {
    console.log('[MarketingPage]', meLoading, isUserSync)
    if (meLoading || !isUserSync) return
    alert(`Setting timeout: ${meLoading}`)
    const timeOut = setTimeout(() => {
      router.replace(router.pathname, undefined, { shallow: true }).then(() => {
        if (hasAccess) {
          window.location.reload()
        }
      })
    }, 2500)

    return () => clearTimeout(timeOut)
  }, [router, isUserSync, meLoading])

  useEffect(() => {
    if (meLoading || isUserSync) {
      return
    }
    if (hasAccess) {
      window.location.reload()
    }
  }, [meLoading, hasAccess, isUserSync])

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
