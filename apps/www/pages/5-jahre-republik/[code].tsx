import { createGetServerSideProps } from '../../lib/apollo/helpers'
import InviteReceiverPage, {
  InviteReceiverPageProps,
} from '../../components/FutureCampaign/ReceiverPage/InviteReceiverPage'
import {
  InviteSenderProfileQueryData,
  InviteSenderProfileQueryVariables,
  INVITE_SENDER_PROFILE_QUERY,
} from '../../components/FutureCampaign/graphql/useSenderProfileQuery'

export default InviteReceiverPage

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
