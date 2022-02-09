import React, { Component } from 'react'
import PropTypes from 'prop-types'

// save headers in a global when receiving them in the browser
let savedHeaders

export class HeadersProvider extends Component {
  constructor(props, ...rest) {
    super(props, ...rest)
    // write headers to a global when the first page renders in the client
    // - browser only to ensure that it isn't shared between connections (which would be bad)
    if (process.browser && props.headers) {
      savedHeaders = props.headers
    }
  }
  getChildContext() {
    return {
      headers: this.props.headers || savedHeaders,
    }
  }
  render() {
    return this.props.children
  }
}

HeadersProvider.childContextTypes = {
  headers: PropTypes.object,
}

const withHeaders = (WrappedComponent) => {
  const WithHeaders = (props, context) => (
    <WrappedComponent {...props} headers={context.headers} />
  )

  WithHeaders.contextTypes = {
    headers: PropTypes.object,
  }

  return WithHeaders
}

export default withHeaders
