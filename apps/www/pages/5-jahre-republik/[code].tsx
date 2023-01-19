import { createGetServerSideProps } from '../../lib/apollo/helpers'
import InviteReceiverPage from '../../components/FutureCampaign/ReceiverPage/InviteReceiverPage'

export default InviteReceiverPage

export const getServerSideProps = createGetServerSideProps(
  async ({
    client,
    user,
    ctx: {
      params: { code },
    },
  }) => {
    console.debug('SSR 5-year-republik for code: ' + code)

    // Step 1:
    // TODO: Get access-token associated with the code from api
    // TODO: else error page

    // Step 2:
    // TODO: If access-token is valid, get inviter-user from api

    // Step 3:
    // TODO: If inviter-user = request-user, redirect to '/verstaerkung-holen'
    if (code === 'SELF') {
      return {
        redirect: {
          destination: '/verstaerkung-holen',
          permanent: false,
        },
      }
    }

    return {
      props: {},
    }
  },
)
