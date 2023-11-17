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

  for (const article of articles) {
    const url = new URL(article.path as string, 'https://www.republik.ch')

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

    const item = await client.items.update(article.id, {
      repo_id: data.document.repoId,
      query_string: url.search,
    })

    console.log('Updated item with repo ID', item.repo_id)
  }
}
