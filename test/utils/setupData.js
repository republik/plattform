import React from 'react'
import { ApolloProvider } from 'react-apollo'
import initApollo from '../../lib/apollo/initApollo'

export default initialState => {
  const client = initApollo(
    initialState,
    {},
    {
      API_URL: 'http://localhost/graphql'
    }
  )
  const withData = ComposedComponent => props => (
    <ApolloProvider client={client}>
      <ComposedComponent {...props} />
    </ApolloProvider>
  )

  return {
    client,
    withData
  }
}
