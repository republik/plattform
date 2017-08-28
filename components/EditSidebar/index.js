import Portal from 'react-portal'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { colors } from '@project-r/styleguide'
import CloseIcon from 'react-icons/lib/md/close'

const panelWidthPx = 180
const transitionDurationMs = 300

const styles = {
  container: css({
    position: 'absolute',
    top: 0,
    right: '10px'
  }),
  toolbar: {
    backgroundColor: '#fff',
    borderLeft: `1px solid ${colors.divider}`,
    borderRadius: '2px 0 0 2px',
    bottom: 0,
    width: `${panelWidthPx}px`,
    opacity: 1,
    padding: '40px 10px 10px',
    position: 'absolute',
    right: 0,
    top: 0,
    transition: `right ${transitionDurationMs}ms`,
    zIndex: 1
  },
  closeButton: css({
    padding: '10px',
    position: 'absolute',
    right: 0,
    top: 0,
    ':hover': {
      opacity: 0.6
    }
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
        <a
          onClick={this.props.closePortal}
          {...styles.closeButton}
          title='Close'
        >
          <CloseIcon color='#000' size={24} />
        </a>
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

export default class EditSidebar extends Component {
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
          isOpened
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

EditSidebar.propTypes = {
  state: PropTypes.object
}
