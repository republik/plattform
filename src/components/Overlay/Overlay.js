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

    // The code below is used to block scrolling of the page behind the overlay.
    // The trick is to add overflow:hidden and position:relative to the body
    // element. The later scrolls the page to the top, to counter that we shift
    // the whole page up by the appropriate offset and restore the scroll offset
    // when the overlay is dismissed.
    this.pageYOffset = window.pageYOffset
    document.documentElement.style.top = `-${this.pageYOffset}px`
    document.documentElement.style.position = 'relative'
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
  }

  componentWillUnmount () {
    clearTimeout(this.fadeInTimeout)

    // Remove scroll block and scroll page back to its original Y-offset.
    document.documentElement.style.top = ''
    document.documentElement.style.position = ''
    document.body.style.overflow = ''
    document.body.style.position = ''
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
