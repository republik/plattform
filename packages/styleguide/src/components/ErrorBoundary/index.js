import React, { PureComponent, Fragment } from 'react'
import { P } from '../Typography/Interaction'
import colors from '../../theme/colors'

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
          <P style={{ color: colors.error, margin: '20px 0' }}>
            {failureMessage}
          </P>
          {showException && (
            <P style={{ color: colors.error, margin: '20px 0' }}>
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
