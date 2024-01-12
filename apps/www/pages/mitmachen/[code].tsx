import { createGetServerSideProps } from '../../lib/apollo/helpers'
import InviteReceiverPage, {
  InviteReceiverPageProps,
} from '../../components/FutureCampaign/ReceiverPage/InviteReceiverPage'
import {
  InviteSenderProfileQueryData,
  InviteSenderProfileQueryVariables,
  INVITE_SENDER_PROFILE_QUERY,
} from '../../components/FutureCampaign/graphql/useSenderProfileQuery'
import { ColorContextProvider } from '@project-r/styleguide'
import { FUTURE_CAMPAIGN_SHARE_IMAGE_URL } from '../../components/FutureCampaign/constants'
import { PUBLIC_BASE_URL } from '../../lib/constants'
import { useRouter } from 'next/router'
import Meta from '../../components/Frame/Meta'
import FutureCampaignPage from '../../components/FutureCampaign/FutureCampaignPage'

function Page(props: InviteReceiverPageProps) {
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
      <InviteReceiverPage {...props} />
    </FutureCampaignPage>
  )
}

export default function WrappedPage(props: InviteReceiverPageProps) {
  return (
    <ColorContextProvider colorSchemeKey='dark'>
      <Page {...props} />
    </ColorContextProvider>
  )
}

export const getServerSideProps = createGetServerSideProps<
  InviteReceiverPageProps,
  { code: string }
>(async ({ client, ctx: { params }, user: me }) => {
  try {
    // If a sender has a public-profile, the invite-code starts with '~'

    const { data } = await client.query<
      InviteSenderProfileQueryData,
      InviteSenderProfileQueryVariables
    >({
      query: INVITE_SENDER_PROFILE_QUERY,
      variables: {
        accessToken: params.code,
      },
    })

    // If a user opens his own invite link, redirect to the sender page
    if (me && data?.sender?.id === me.id) {
      return {
        redirect: {
          destination: '/verstaerkung-holen',
          permanent: false,
        },
      }
    }

    return {
      props: {
        invalidInviteCode: !data?.sender,
      },
    }
  } catch (e) {
    console.error(e)
    return {
      props: {
        invalidInviteCode: true,
      },
    }
  }
})
