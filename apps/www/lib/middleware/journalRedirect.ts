import { gql } from '@apollo/client'
import { initializeApollo } from '../apollo'

const latestJournalEntryPathQuery = gql`
  query latestJournalEntryPath {
    documents(format: "republik/format-journal", first: 1) {
      nodes {
        meta {
          path
        }
      }
    }
  }
`

/**
 *
 * @returns
 */
export async function getLatestJournalPath() {
  const client = initializeApollo(null, {
    headers: {
      authorization: `DocumentApiKey ${process.env.SSG_DOCUMENTS_API_KEY}`,
    },
  })

  const { data } = await client.query({
    query: latestJournalEntryPathQuery,
  })

  const latestPath = data?.documents?.nodes[0]?.meta?.path

  return latestPath
}
