import { createRequire } from '@republik/dynamic-components'

/*
 * import all react-apollo and graphql-tag functions
 * for dynamic components
 */

/* eslint-disable */
import { ApolloConsumer, ApolloProvider, gql } from '@apollo/client'
import { Mutation, Query, Subscription } from '@apollo/client/react/components'
import {
  graphql,
  withApollo,
  withMutation,
  withQuery,
  withSubscription,
} from '@apollo/client/react/hoc'
import compose from 'lodash/flowRight'
/* eslint-enable */

export default createRequire().alias({
  'react-apollo': {
    // Reexport react-apollo
    // (work around until all dynamic components are updated)
    // ApolloContext is no longer available but is exported in old versions of react-apollo
    ApolloConsumer,
    ApolloProvider,
    Query,
    Mutation,
    Subscription,
    graphql,
    withQuery,
    withMutation,
    withSubscription,
    withApollo,
    compose,
  },
  // Reexport graphql-tag to be used by dynamic-components
  'graphql-tag': gql,
})
