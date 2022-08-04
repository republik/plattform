import { createApolloClientUtilities } from '@republik/nextjs-apollo-client'
import { ApolloProvider } from '@apollo/client'

const { initializeApollo } = createApolloClientUtilities({
  apiUrl: 'http://localhost/graphql',
})

export default (initialState) => {
  const client = initializeApollo(initialState, {})
  const withData = (ComposedComponent) => (props) =>
    (
      <ApolloProvider client={client}>
        <ComposedComponent {...props} />
      </ApolloProvider>
    )

  return {
    client,
    withData,
  }
}
