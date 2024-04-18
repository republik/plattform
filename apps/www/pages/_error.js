import * as Sentry from '@sentry/nextjs'
import { Component } from 'react'

import Frame from '../components/Frame'
import StatusError from '../components/StatusError'

class ErrorPage extends Component {
  /**
   * Get the initial props for the error page.
   * @param {import('next').NextPageContext} ctx
   * @returns
   */
  static async getInitialProps(ctx) {
    await Sentry.captureUnderscoreErrorException(ctx)
    const { res, err } = ctx
    const statusCode = res ? res.statusCode : err ? err.statusCode : null
    return { statusCode }
  }

  render() {
    const { statusCode, serverContext } = this.props
    return (
      <Frame raw>
        <StatusError statusCode={statusCode} serverContext={serverContext} />
      </Frame>
    )
  }
}

export default ErrorPage
