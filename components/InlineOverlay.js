import { Component } from 'react'
import { createPortal } from 'react-dom'
import { css } from 'glamor'

const styles = {
  overlay: css({
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#fff',
    zIndex: '10'
  })
}

class Portal extends Component {
  componentWillUnmount() {
    if (this.defaultNode) {
      document.body.removeChild(this.defaultNode)
    }
    this.defaultNode = null
  }

  render() {
    if (!process.browser) {
      return null
    }
    if (!this.props.node && !this.defaultNode) {
      this.defaultNode = document.createElement('div')
      document.body.appendChild(this.defaultNode)
    }
    return createPortal(
      this.props.children,
      this.props.node || this.defaultNode
    )
  }
}

export default ({ children }) => {
  return (
    <Portal
      node={document && document.getElementById('content')}
    >
      <div {...styles.overlay}>{children}</div>
    </Portal>
  )
}
