import {
  makeCreateGetServerSideProps,
  makeCreateGetStaticProps,
} from '@republik/nextjs-apollo-client'
import { initializeApollo } from '.'
import { MeObjectType } from '../context/MeContext'
import { meQuery } from './withMe'

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
