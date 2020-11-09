import React from 'react'
import initApollo from './initApollo'
import Head from 'next/head'
import { getDataFromTree } from 'react-apollo'

const WithApolloClient = App => {
  return class withApolloClient extends React.Component {
    static displayName = `withApolloClient(${App.displayName ||
      App.name ||
      'App'})`
    static async getInitialProps(appCtx) {
      const { ctx, AppTree } = appCtx

      let appProps = {}
      if (App.getInitialProps) {
        appProps = await App.getInitialProps(appCtx)
      }

      // We forward the accept header for webp detection
      // - never forward cookie to client!
      const headers = !process.browser
        ? {
            accept: ctx.req.headers.accept,
            userAgent: ctx.req.headers['user-agent']
          }
        : undefined

      // Run all GraphQL queries in the component tree
      // and extract the resulting data
      let apolloState
      if (!process.browser) {
        const apollo = initApollo(undefined, ctx.req.headers)
        try {
          // Run all GraphQL queries
          await getDataFromTree(
            <AppTree
              {...appProps}
              apolloClient={apollo}
              headers={headers}
              serverContext={ctx}
            />
          )
        } catch (error) {
          // Prevent Apollo Client GraphQL errors from crashing SSR.
          // Handle them in components via the data.error prop:
          // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
          console.error('Error while running `getDataFromTree`', error)
        }

        // getDataFromTree does not call componentWillUnmount
        // head side effect therefore need to be cleared manually
        Head.rewind()

        // Extract query data from the Apollo store
        apolloState = apollo.cache.extract()
      }

      return {
        ...appProps,
        apolloState,
        headers
      }
    }

    constructor(props) {
      super(props)
      this.apolloClient =
        props.apolloClient || initApollo(props.apolloState, props.headers)
    }

    render() {
      // omit apolloState from forwarding
      const { apolloState, ...props } = this.props
      return <App {...props} apolloClient={this.apolloClient} />
    }
  }
}

export default WithApolloClient
