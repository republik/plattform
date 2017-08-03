import Portal from 'react-portal'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { colors } from '@project-r/styleguide'

const styles = {
  container: css({
    position: 'absolute',
    top: 0,
    right: '10px'
  }),
  toolbar: {
    backgroundColor: colors.primaryBg,
    borderColor: '#222',
    borderRadius: '2px 0 0 2px',
    minWidth: '250px',
    opacity: 1,
    padding: '0 10px',
    position: 'absolute',
    right: 0,
    top: 0,
    transition: 'opacity .75s, top 0.3s',
    zIndex: 1
  },
  closeButton: css({
    position: 'absolute',
    right: '10px',
    top: '10px'
  }),
  openButton: css({
    position: 'absolute',
    right: 0,
    top: '10px'
  })
}

class PseudoModal extends React.Component {
  // eslint-disable-line
  render () {
    return (
      <div {...css(styles.toolbar)}>
        <button onClick={this.props.closePortal} {...styles.closeButton}>
          Close
        </button>
        {this.props.children}
      </div>
    )
  }
}

PseudoModal.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element
  ]),
  closePortal: PropTypes.func
}

export default class ProcessToolbar extends Component {
  constructor (props) {
    super(props)
    this.state = this.getInitialState(this.props)
    this.openHandler = this.openHandler.bind(this)
  }

  getInitialState (props) {
    return { toolbar: false }
  }

  componentDidMount () {
    this.updateToolbar()
  }

  componentDidUpdate () {
    this.updateToolbar()
  }

  openHandler (portal) {
    this.setState({ toolbar: portal.firstChild })
  }

  updateToolbar () {
    const { toolbar } = this.state
    const { state } = this.props

    if (!toolbar) return

    if (state.isBlurred || !process.browser) {
      toolbar.style.opacity = 0
    }
    toolbar.style.opacity = 1
  }

  render () {
    const { children } = this.props
    const openButton = <button {...styles.openButton}>Toolbar</button>
    return (
      <div {...styles.container}>
        <Portal
          closeOnEsc
          openByClickOn={openButton}
          testProp={this.state.someValue}
        >
          <PseudoModal>
            <div {...css(styles.hoverToolbar)}>
              {children}
            </div>
          </PseudoModal>
        </Portal>
      </div>
    )
  }
}

ProcessToolbar.propTypes = {
  state: PropTypes.object
}
