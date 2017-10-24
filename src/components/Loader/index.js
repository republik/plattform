import React, { Component } from 'react'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { Interaction } from '../Typography'
import Spinner from '../Spinner'

const { P } = Interaction

const styles = {
  error: css({
    color: colors.error
  }),
  message: css({
    position: 'absolute',
    top: '50%',
    marginTop: 30,
    width: '100%',
    textAlign: 'center'
  }),
  spacer: css({
    position: 'relative',
    minHeight: 120,
    height: '100%',
    minWidth: '100%'
  })
}

const ErrorMessage = ({ error }) => (
  <P {...styles.error}>
    {error.graphQLErrors && error.graphQLErrors.length ? (
      error.graphQLErrors.map(e => e.message).join(', ')
    ) : (
      error.toString()
    )}
  </P>
)

const Spacer = ({ style, children }) => (
  <div {...styles.spacer} style={style}>
    {children}
  </div>
)

class Loader extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false
    }
  }
  componentDidMount() {
    this.timeout = setTimeout(
      () => this.setState({ visible: true }),
      this.props.delay
    )
  }
  componentWillUnmount() {
    clearTimeout(this.timeout)
  }
  render() {
    const { visible } = this.state
    const { style, message, loading, error, render, ErrorContainer } = this.props

    if (loading && !visible) {
      return <Spacer style={style} />
    } else if (loading) {
      return (
        <Spacer style={style}>
          <Spinner />
          {!!message && <P {...styles.message}>{message}</P>}
        </Spacer>
      )
    } else if (error) {
      return (
        <ErrorContainer>
          <ErrorMessage error={error} />
        </ErrorContainer>
      )
    }
    return render()
  }
}

Loader.defaultProps = {
  delay: 500,
  render: () => null,
  ErrorContainer: ({children}) => children
}

export default Loader
