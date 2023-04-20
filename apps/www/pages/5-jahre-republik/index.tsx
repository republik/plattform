import InviteReceiverPage from '../../components/FutureCampaign/ReceiverPage/InviteReceiverPage'
import { createGetServerSideProps } from '../../lib/apollo/helpers'
import {
  ColorContextProvider,
  ColorHtmlBodyColors,
} from '@project-r/styleguide'
import { useRouter } from 'next/router'
import Meta from '../../components/Frame/Meta'
import { FUTURE_CAMPAIGN_SHARE_IMAGE_URL } from '../../components/FutureCampaign/constants'
import FutureCampaignPage from '../../components/FutureCampaign/FutureCampaignPage'
import { PUBLIC_BASE_URL } from '../../lib/constants'
import { FUTURE_CAMPAIGN_END_DATE } from '../../components/FutureCampaign/ReceiverPage/steps/IntroductionaryStep'

function Page() {
  const router = useRouter()

  const meta = {
    pageTitle: 'Werden Sie Teil der Republik',
    title: 'Werden Sie Teil der Republik',
    image: FUTURE_CAMPAIGN_SHARE_IMAGE_URL,
    url: `${PUBLIC_BASE_URL}${router.asPath}`,
  }

  return (
    <FutureCampaignPage>
      <Meta data={meta} />
      <InviteReceiverPage />
    </FutureCampaignPage>
  )
}

export default function WrappedPage() {
  return (
    <ColorContextProvider colorSchemeKey='dark' root>
      <ColorHtmlBodyColors colorSchemeKey='dark' />
      <Page />
    </ColorContextProvider>
  )
}

export const getServerSideProps = createGetServerSideProps(
  async ({ user: me }) => {
    try {
      const hasMonthlySubscription =
        me?.activeMembership?.type?.name === 'MONTHLY_ABO'

      if (!!me?.activeMembership && !hasMonthlySubscription) {
        return {
          redirect: {
            destination: '/verstaerkung-holen',
            permanent: false,
          },
        }
      }

      const now = new Date(Date.now())
      if (now.getTime() > FUTURE_CAMPAIGN_END_DATE.getTime()) {
        return {
          redirect: {
            destination: '/',
            permanent: false,
          },
        }
      }

      return {
        props: {},
      }
    } catch (e) {
      console.error(e)
      return {
        props: {},
      }
    }
  },
)