import { Client } from '@datocms/cli/lib/cma-client-node'
import { ApolloClient, HttpLink, InMemoryCache, gql } from '@apollo/client'

export default async function (client: Client): Promise<void> {
  const apolloClient = new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: process.env.NEXT_PUBLIC_API_URL,
    }),
  })

  // DatoCMS migration script

  // For more examples, head to our Content Management API docs:
  // https://www.datocms.com/docs/content-management-api

  // Create an Article model:
  // https://www.datocms.com/docs/content-management-api/resources/item-type/create
  const articles = await client.items.list({ filter: { type: '2314038' } })
  const newsletters = await client.items.list({ filter: { type: '2314039' } })

  for (const item of [...articles, ...newsletters]) {
    const url = new URL(item.path as string, 'https://www.republik.ch')

    const { data, error } = await apolloClient.query({
      query: gql`
        query GetDoc($path: String!) {
          document(path: $path) {
            repoId
          }
        }
      `,
      variables: { path: url.pathname },
    })

    if (error) {
      throw error
    }

    if (!data.document) {
      throw Error(`No document found for path: ${url.pathname}`)
    }
    // console.log('path:', url.pathname)
    // console.log('query:', url.search)
    // console.log('repo:', data.document?.repoId)

    const updatedItem = await client.items.update(
      item.id,
      item.item_type.id === '2314038'
        ? {
            repo_id: data.document.repoId,
            query_string: url.search,
          }
        : {
            repo_id: data.document.repoId,
          },
    )

    console.log('Updated item with repo ID', updatedItem.repo_id)
  }
}
