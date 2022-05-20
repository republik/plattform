import createGetServerSideProps from '../../lib/helpers/createGetServerSideProps'
import { PageCenter } from '../../components/Auth/withAuthorization'
import Loader from '../../components/Loader'
import Frame from '../../components/Frame'

const GatewayPage = () => {
  const meta = {
    title: 'Gateway',
  }

  return (
    <Frame meta={meta}>
      <PageCenter>
        <Loader loading />
      </PageCenter>
    </Frame>
  )
}

export default GatewayPage

/**
 * GetServerSideProps fetches me and syncs the cookies (session & JWT)
 * Once that done it's redirected to marketing-/front
 */
export const getServerSideProps = createGetServerSideProps(
  async (client, params, me, ctx) => {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  },
)
