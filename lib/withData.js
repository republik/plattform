import React from 'react'
import PropTypes from 'prop-types'
import { ApolloProvider, getDataFromTree } from 'react-apollo'
import initApollo from './initApollo'

// Gets the display name of a JSX component for dev tools
function getComponentDisplayName (Component) {
  return Component.displayName || Component.name || 'Unknown'
}

export default ComposedComponent => {
  class WithData extends React.Component {
    static async getInitialProps (ctx) {
      let serverState = {}

      // Evaluate the composed component's getInitialProps()
      let composedInitialProps = {}
      if (ComposedComponent.getInitialProps) {
        composedInitialProps = await ComposedComponent.getInitialProps(ctx)
      }

      // we forward the accept header for webp detection
      // - never forward cookie to client!
      const headers = !process.browser
        ? {accept: ctx.req.headers.accept}
        : {}

      // Run all GraphQL queries in the component tree
      // and extract the resulting data
      if (!process.browser) {
        // server-side we initialize apollo with all headers (including cookie)
        const apollo = initApollo(undefined, ctx.req.headers)
        // Provide the `url` prop data in case a GraphQL query uses it
        const url = {
          query: ctx.query,
          pathname: ctx.pathname,
          asPath: ctx.asPath
        }

        try {
          // Run all GraphQL queries
          await getDataFromTree(
            <ApolloProvider client={apollo}>
              <ComposedComponent url={url} {...composedInitialProps} serverContext={ctx} headers={headers} />
            </ApolloProvider>
          )
        } catch (error) {
          console.log(error)
          // Prevent Apollo Client GraphQL errors from crashing SSR.
          // Handle them in components via the data.error prop:
          // http://dev.apollodata.com/react/api-queries.html#graphql-query-data-error
        }

        serverState = apollo.cache.extract()
      }

      return {
        serverState,
        headers,
        ...composedInitialProps
      }
    }

    constructor (props) {
      super(props)
      this.apollo = initApollo(this.props.serverState, this.props.headers)
    }

    render () {
      return (
        <ApolloProvider client={this.apollo}>
          <ComposedComponent {...this.props} />
        </ApolloProvider>
      )
    }
  }

  WithData.displayName = `WithData(${getComponentDisplayName(
    ComposedComponent
  )})`
  WithData.propTypes = {
    serverState: PropTypes.object.isRequired
  }

  return WithData
}
