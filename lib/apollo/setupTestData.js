import { ApolloProvider } from 'react-apollo'
import initApollo from './initApollo'

export default (initialState) => {
  const client = initApollo(initialState, {}, {
    API_BASE_URL: 'http://127.0.0.1/graphql'
  })
  const withData = ComposedComponent => (props) => (
    <ApolloProvider client={client}>
      <ComposedComponent {...props} />
    </ApolloProvider>
  )

  return {
    client,
    withData
  }
}
