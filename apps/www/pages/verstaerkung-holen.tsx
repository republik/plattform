import {
  UserInviteQueryData,
  USER_INVITE_QUERY,
} from '../components/FutureCampaign/graphql/useUserInviteQuery'
import InviteSenderPage from '../components/FutureCampaign/SenderPage/InviteSenderPage'
import { createGetServerSideProps } from '../lib/apollo/helpers'

export default InviteSenderPage

export const getServerSideProps = createGetServerSideProps(
  async ({ client }) => {
    await client.query<UserInviteQueryData>({
      query: USER_INVITE_QUERY,
    })
    return { props: {} }
  },
)
