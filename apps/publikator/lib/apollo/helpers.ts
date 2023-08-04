import {
  makeWithDefaultSSR,
  makeSSGDataFetchingHelpers,
  makeSSRDataFetchingHelpers,
} from '@republik/nextjs-apollo-client'
import { initializeApollo } from '.'
import { meQuery } from '../withMe'

export const withDefaultSSR = makeWithDefaultSSR(
  initializeApollo,
  async (client) => {
    await client.query({
      query: meQuery,
    })
  },
)

type MeObjectType = {
  id: string
  username: string
  name: string
  initials: string
  firstName: string
  lastName: string
  email: string
  portrait: string
  roles: string[]
  isListed: boolean
  hasPublicProfile: boolean
  discussionNotificationChannels: string[]
  accessCampaigns: { id: string }[]
  prolongBeforeDate: string
  activeMembership: {
    id: string
    type: {
      name: string
    }
    endDate: string
    graceEndDate: string
  }
  progressConsent: boolean
  prolitterisOptOut: boolean
}

// Prepare Next.js data-fetching helpers with the generated initializeApollo function
export const { createGetStaticProps } =
  makeSSGDataFetchingHelpers(initializeApollo)

export const createGetServerSideProps =
  makeSSRDataFetchingHelpers<MeObjectType>(initializeApollo, async (client) => {
    const {
      data: { me },
    } = await client.query<{ me?: MeObjectType }>({
      query: meQuery,
    })
    return me
  })
