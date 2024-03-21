import * as Sentry from '@sentry/nextjs'
import { Component } from 'react'
import Frame from '../components/Frame'
import Error from 'next/error'

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
    const { statusCode } = this.props
    return (
      <Frame>
        <Frame.Body raw>
          <Error statusCode={statusCode} />
        </Frame.Body>
      </Frame>
    )
  }
}

export default ErrorPage
