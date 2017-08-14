import Portal from 'react-portal'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { colors } from '@project-r/styleguide'

const panelWidthPx = 250
const transitionDurationMs = 300

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
    width: `${panelWidthPx}px`,
    opacity: 1,
    padding: '0 10px 10px',
    position: 'absolute',
    right: 0,
    top: 0,
    transition: `right ${transitionDurationMs}ms`,
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
  }

  getInitialState (props) {
    return { toolbar: false }
  }

  render () {
    const { children } = this.props
    const openButton = <button {...styles.openButton}>Toolbar</button>
    return (
      <div {...styles.container}>
        <Portal
          closeOnEsc
          openByClickOn={openButton}
          onOpen={portal => {
            this.setState({ toolbar: portal.firstChild })
            portal.firstChild.style.right = '-' + panelWidthPx + 'px'
            // 0 timeout to trigger a browser reflow and allow for the transition.
            setTimeout(() => {
              portal.firstChild.style.right = '0'
            }, 0)
          }}
          beforeClose={(portal, removeFromDom) => {
            portal.firstChild.style.right = '-' + panelWidthPx + 'px'
            setTimeout(removeFromDom, transitionDurationMs)
          }}
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
