import * as Sentry from '@sentry/nextjs'
import App from 'next/app'
import { Component } from 'react'
import { Body, Content } from '../components/Layout'
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
      <App>
        <Body>
          <Content id='content'>
            <Error statusCode={statusCode} />
          </Content>
        </Body>
      </App>
    )
  }
}

export default ErrorPage
