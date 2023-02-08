import { createGetServerSideProps } from '../../lib/apollo/helpers'
import InviteReceiverPage, {
  InviteReceiverPageProps,
} from '../../components/FutureCampaign/ReceiverPage/InviteReceiverPage'
import {
  InviteSenderProfileQueryData,
  InviteSenderProfileQueryVariables,
  INVITE_SENDER_PROFILE_QUERY,
} from '../../components/FutureCampaign/graphql/useSenderProfileQuery'
import FutureCampaignHeader from '../../components/FutureCampaign/ReceiverPage/FutureCampaignHeader'
import {
  ColorContextProvider,
  useColorContext,
  mediaQueries,
} from '@project-r/styleguide'
import { FUTURE_CAMPAIGN_SHARE_IMAGE_URL } from '../../components/FutureCampaign/constants'
import { PUBLIC_BASE_URL } from '../../lib/constants'
import { useRouter } from 'next/router'
import Meta from '../../components/Frame/Meta'
import { css } from 'glamor'

function Page(props: InviteReceiverPageProps) {
  const router = useRouter()
  const [colorScheme] = useColorContext()

  const meta = {
    pageTitle: 'Werden Sie Teil der Republik',
    title: 'Werden Sie Teil der Republik',
    //description: 'baz',
    image: FUTURE_CAMPAIGN_SHARE_IMAGE_URL,
    url: `${PUBLIC_BASE_URL}${router.asPath}`,
  }

  css.global('body', {
    backgroundColor: colorScheme.getCSSColor('default'),
    color: colorScheme.getCSSColor('text'),
  })

  return (
    <div {...styles.page}>
      <Meta data={meta} />
      <FutureCampaignHeader />
      <div {...styles.content}>
        <InviteReceiverPage {...props} />
      </div>
    </div>
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
  // If a sender has a public-profile, the invite-code starts with '~'
  const isUserSlug = params.code.startsWith('~')

  const { data } = await client.query<
    InviteSenderProfileQueryData,
    InviteSenderProfileQueryVariables
  >({
    query: INVITE_SENDER_PROFILE_QUERY,
    variables: {
      accessToken: !isUserSlug ? params.code : undefined,
      slug: isUserSlug ? params.code.substring(1) : undefined,
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
})

const styles = {
  page: css({
    height: '100vh',
    display: 'grid',
    width: '100%',
    gap: 32,
    gridTemplateRows: 'auto 1fr',
    maxWidth: 600,
    margin: '0 auto',
  }),
  content: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0 15px',
    [mediaQueries.mUp]: {
      height: 600,
      maxHeight: '100%',
    },
  }),
}
