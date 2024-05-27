import React from 'react'
import { Loader } from '@project-r/styleguide'
import Layout from './Layout'
import Head from 'next/head'
import { gql } from '@apollo/client'
import { graphql } from '@apollo/client/react/hoc'

const getRedirect = gql`
  query getRedirect($path: String!, $externalBaseUrl: String!) {
    redirection(path: $path, externalBaseUrl: $externalBaseUrl) {
      target
      status
    }
  }
`

const StatusError = ({ loading }) => (
  <Loader
    loading={loading}
    render={() => (
      <Layout>
        <Head>
          <title>404</title>
        </Head>
        <h1>404</h1>
        <p>Seite nicht gefunden.</p>
      </Layout>
    )}
  />
)

export default graphql(getRedirect, {
  props: ({ data, ownProps: { serverContext, externalBaseUrl } }) => {
    const redirection = !data.error && !data.loading && data.redirection
    if (redirection) {
      const { target, status } = redirection
      serverContext.res.redirect(status || 302, `${externalBaseUrl}${target}`)
      return { loading: true }
    } else if (serverContext) {
      serverContext.res.statusCode = 404
    }
    return { loading: false }
  },
})(StatusError)
