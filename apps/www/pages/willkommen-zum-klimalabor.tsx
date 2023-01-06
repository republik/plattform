import LandingPage from '../components/Climatelab/LandingPage/Page'
import { createGetServerSideProps } from '../lib/apollo/helpers'
import { checkRoles } from '../lib/apollo/withMe'
import { CLIMATE_LAB_ROLE } from '../components/Climatelab/constants'

export default LandingPage

//TODO: remove code below on 09.01.2023
export const getServerSideProps = createGetServerSideProps(
  async ({ ctx: { query }, user }) => {
    if (
      (user && checkRoles(user, ['editor', CLIMATE_LAB_ROLE])) ||
      (query && Object.keys(query).includes('interner-test'))
    ) {
      return {
        props: {},
      }
    }

    return {
      notFound: true,
    }
  },
)
