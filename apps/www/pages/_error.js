import React from 'react'

import Frame from '../components/Frame'
import StatusError from '../components/StatusError'

class ErrorPage extends React.Component {
  static getInitialProps({ res, err }) {
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
