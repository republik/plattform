import React, { PureComponent, Fragment } from 'react'
import { P } from '../Typography/Interaction'

class ErrorBoundary extends PureComponent {
  constructor(...args) {
    super(...args)

    this.state = {}
  }
  componentDidCatch(error) {
    this.setState({ error })
  }
  render() {
    const { children, failureMessage, showException } = this.props
    const { error } = this.state
    if (error) {
      return (
        <Fragment>
          <P style={{ color: 'var(--color-error)', margin: '20px 0' }}>
            {failureMessage}
          </P>
          {showException && (
            <P style={{ color: 'var(--color-error)', margin: '20px 0' }}>
              {error.toString()}
            </P>
          )}
        </Fragment>
      )
    }
    return children
  }
}

export default ErrorBoundary
