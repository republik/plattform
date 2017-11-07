import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import {css} from 'glamor'
import zIndex from '../../theme/zIndex'
import {mUp} from '../../theme/mediaQueries'

const styles = {
  root: css({
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: zIndex.overlay,
    transition: 'opacity .12s ease-in-out',
    background: 'rgba(0,0,0,.2)',

    [mUp]: {
      overflowY: 'auto',
    },
  }),
  inner: css({
    position: 'relative',
    zIndex: 1, // to establish a stacking context
    background: 'white',
    height: '100vh',
    boxShadow: '0 0 6px rgba(0,0,0,.2)',
    overflowY: 'auto',

    [mUp]: {
      maxWidth: '600px',
      minHeight: '60vh',
      height: 'auto',
      margin: '20vh auto 20vh',
      overflowY: 'visible'
    },
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

    this.pageYOffset = window.pageYOffset
    document.documentElement.style.top = `-${this.pageYOffset}px`
    document.documentElement.style.position = 'relative'

    // Add overflow:hidden to the body element to remove any scroll bars. The overlay uses
    // width:100vw and that is the width of the whole viewport /including/ the scroll bar.
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
  }
  componentWillUnmount () {
    clearTimeout(this.fadeInTimeout)
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.documentElement.style.top = '0'
    window.scrollTo(0, this.pageYOffset)
  }

  render () {
    return (
      <OverlayRenderer
        {...this.props}
        isVisible={this.state.isVisible}
      />
    )
  }
}

Overlay.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default Overlay

// This is the actual Overlay component that is rendered. We export this so we
// can document the overlay in the catalog without affecting 'document.body'.
export class OverlayRenderer extends PureComponent {
  constructor (props) {
    super(props)

    // This event handler is attached to the background of the overlay.
    this.close = (e) => {
      if (e.target === e.currentTarget) {
        this.props.onClose()
      }
    }
  }

  render () {
    const {isVisible, children} = this.props
    return (
      <div {...styles.root} style={{opacity: isVisible ? 1 : 0}} onClick={this.close}>
        <div {...styles.inner}>
          {children}
        </div>
      </div>
    )
  }
}

OverlayRenderer.propTypes = {
  children: PropTypes.node.isRequired,
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}
