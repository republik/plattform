import Portal from 'react-portal'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'

const styles = {
  hoverToolbar: {
    padding: '8px 7px 6px',
    position: 'absolute',
    zIndex: 1,
    left: '0',
    marginTop: '-6px',
    opacity: 0,
    backgroundColor: '#999',
    borderColor: '#222',
    borderRadius: '4px',
    transition: 'opacity .75s, top 0.3s',
    '& .button': {
      textAlign: 'center',
      display: 'block',
      minWidth: '10px',
      cursor: 'pointer'
    },
    '& .button[data-active="true"]': {
      backgroundColor: '#fff'
    }
  }
}

export default class SideToolbar extends Component {
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
      return
    }
    const selection = window.getSelection()
    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    toolbar.style.opacity = 1
    toolbar.style.top = `${rect.top + window.scrollY}px`
  }

  render () {
    const { children } = this.props
    return (
      <Portal isOpened onOpen={this.openHandler}>
        <div {...css(styles.hoverToolbar)}>
          {children.map((child, i) => <div key={`key-${i}`}>{child}</div>)}
        </div>
      </Portal>
    )
  }
}
SideToolbar.propTypes = {
  state: PropTypes.object.isRequired
}
