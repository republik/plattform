import React, {Component} from 'react'
import {css} from 'glamor'

import {HEADER_HEIGHT} from './Frame/constants'
import Spinner from './Spinner'
import {errorToString} from '../lib/utils/errors'

import {
  Interaction
} from '@project-r/styleguide'

const {P} = Interaction

const spacerStyle = css({
  position: 'relative',
  minWidth: '100%',
  minHeight: ['100vh', `calc(100vh - ${HEADER_HEIGHT}px)`]
})
const Spacer = ({height, width, children}) => (
  <div {...spacerStyle} style={{minWidth: width, minHeight: height}}>{children}</div>
)

const messageStyle = css({
  position: 'absolute',
  top: '50%',
  marginTop: 30,
  width: '100%',
  textAlign: 'center'
})

class Loader extends Component {
  constructor (props) {
    super(props)
    this.state = {
      visible: false
    }
  }
  componentDidMount () {
    this.timeout = setTimeout(() => this.setState({visible: true}), this.props.delay)
  }
  componentWillUnmount () {
    clearTimeout(this.timeout)
  }
  render () {
    const {visible} = this.state
    const {
      width, height, message,
      loading, error, render
    } = this.props
    if (loading && !visible) {
      return <Spacer width={width} height={height} />
    } else if (loading) {
      return (
        <Spacer width={width} height={height}>
          <Spinner />
          {!!message && <P {...messageStyle}>{message}</P>}
        </Spacer>
      )
    } else if (error) {
      return (
        <Spacer width={width} height={height}>
          {errorToString(error)}
        </Spacer>
      )
    }
    return render()
  }
}

Loader.defaultProps = {
  delay: 500,
  render: () => null
}

export default Loader
