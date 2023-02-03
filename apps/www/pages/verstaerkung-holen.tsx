import {
  UserInviteQueryData,
  USER_INVITE_QUERY,
} from '../components/FutureCampaign/graphql/useUserInviteQuery'
import InviteSenderPage from '../components/FutureCampaign/SenderPage/InviteSenderPage'
import { createGetServerSideProps, withDefaultSSR } from '../lib/apollo/helpers'

export default withDefaultSSR(InviteSenderPage)
