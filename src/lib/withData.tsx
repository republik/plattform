import * as React from 'react'
import {
  ApolloProvider,
  getDataFromTree
} from 'react-apollo'
import Head from 'next/head'
import initApollo from './initApollo'
import { errorToString } from '../lib/utils/errors'

interface Props {
  serverState?: any
}

export default (ComposedComponent: any) => {
  return class WithData extends React.Component<Props> {
    public static displayName = `WithData(${ComposedComponent.displayName})`

    public static async getInitialProps(ctx: any) {
      const headers = ctx.req ? ctx.req.headers : {}

      let serverState = {}

      // Evaluate the composed component's getInitialProps()
      let composedInitialProps = {}
      if (ComposedComponent.getInitialProps) {
        composedInitialProps = await ComposedComponent.getInitialProps(
          ctx
        )
      }
      // Run all graphql queries in the component tree
      // and extract the resulting data
      if (!process.browser) {
        const apollo = initApollo({}, headers)
        // Provide the `url` prop data in case a graphql query uses it
        const url = {
          query: ctx.query,
          pathname: ctx.pathname
        }

        // Run all graphql queries
        const app = (
          <ApolloProvider client={apollo}>
            <ComposedComponent
              url={url}
              {...composedInitialProps}
            />
          </ApolloProvider>
        )
        try {
          await getDataFromTree(app)
        } catch (e) {
          const stringError = errorToString(e)
          if (
            stringError ===
            'Sie müssen sich zuerst einloggen.'
          ) {
            ctx.res.writeHead(302, {
              Location: '/?error=401'
            })
            return ctx.res.end()
          } else {
            return {
              error: e.message
            }
          }
        }
        // getDataFromTree does not call componentWillUnmount
        // head side effect therefore need to be cleared manually
        Head.rewind()

        // Extract query data from the Apollo's store
        const state = apollo.getInitialState()

        serverState = {
          apollo: {
            // Make sure to only include Apollo's data state
            data: state.data
          }
        }
      }

      return {
        serverState,
        ...composedInitialProps
      }
    }

    public apollo: any

    constructor(props: any) {
      super(props)
      this.apollo = initApollo(this.props.serverState)
    }

    public render() {
      return (
        <ApolloProvider client={this.apollo}>
          <ComposedComponent {...this.props} />
        </ApolloProvider>
      )
    }
  }
}
