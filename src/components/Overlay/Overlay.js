import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import {css} from 'glamor'
import {overlay} from '../../theme/zIndex'

const styles = {
  root: css({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: overlay,
    background: 'white',
    transition: 'opacity .12s ease-in-out'
  })
}

class Overlay extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {isVisible: false}
  }
  componentDidMount () {
    // This timeout may not be required, but the fade-in won't work without
    // this inside the catalog.
    this.fadeInTimeout = setTimeout(() => {
      this.setState({isVisible: true})
    })

    // Add overflow:hidden to the body element to remove any scroll bars. The overlay uses
    // width:100vw and that is the width of the whole viewport /including/ the scroll bar.
    document.body.style.overflow = 'hidden'
  }
  componentWillUnmount () {
    clearTimeout(this.fadeInTimeout)
    document.body.style.overflow = ''
  }
  render () {
    const {children, ...props} = this.props
    const {isVisible} = this.state

    return (
      <div {...styles.root} style={{opacity: isVisible ? 1 : 0}} {...props}>
        {children}
      </div>
    )
  }
}

Overlay.propTypes = {
  children: PropTypes.node.isRequired
}

export default Overlay
