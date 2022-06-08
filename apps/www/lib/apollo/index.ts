import {
  createApolloClientUtilities,
  makeCreateGetStaticProps,
  makeCreateGetServerSideProps,
} from '@republik/nextjs-apollo-client'
import { API_URL, API_WS_URL } from '../constants'
import {
  inNativeAppBrowser,
  inNativeAppBrowserLegacy,
} from '../withInNativeApp'
import { createAppWorkerLink } from './appWorkerLink'
import { MeObjectType } from '../context/MeContext'
import { meQuery } from './withMe'

export const { initializeApollo, withApollo } = createApolloClientUtilities({
  apiUrl: API_URL,
  wsUrl: API_WS_URL,
  mobileConfigOptions: {
    isInMobileApp: inNativeAppBrowser && inNativeAppBrowserLegacy,
    createAppWorkerLink,
  },
})

// Prepare Next.js data-fetching helpers with the generated initializeApollo function
export const createGetStaticProps = makeCreateGetStaticProps(initializeApollo)

export const createGetServerSideProps =
  makeCreateGetServerSideProps<MeObjectType>(
    initializeApollo,
    async (client) => {
      const {
        data: { me },
      } = await client.query<{ me?: MeObjectType }>({
        query: meQuery,
      })
      return me
    },
  )
