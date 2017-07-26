import Portal from 'react-portal'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'

const styles = {
  hoverToolbar: {
    padding: '8px 7px 6px',
    position: 'absolute',
    zIndex: 1,
    top: '-10000px',
    left: '0',
    marginTop: '-6px',
    opacity: 0,
    backgroundColor: '#999',
    borderColor: '#222',
    borderRadius: '4px',
    transition: 'opacity .75s',
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

export default blocks => {
  class Toolbar extends Component {
    constructor(props) {
      super(props)
      this.state = this.getInitialState(this.props)
      this.openHandler = this.openHandler.bind(this)
      this.clickBlockHandler = this.clickBlockHandler.bind(
        this
      )
    }

    getInitialState(props) {
      return { toolbar: false }
    }

    componentDidMount() {
      this.updateToolbar()
    }

    componentDidUpdate() {
      this.updateToolbar()
    }

    openHandler(portal) {
      this.setState({ toolbar: portal.firstChild })
    }

    hasBlock(type) {
      const { state } = this.props
      return state.blocks.some(block => block.type === type)
    }

    clickBlockHandler(e, type) {
      e.preventDefault()
      let { state, onChange } = this.props
      state = state.transform().setBlock(type).apply()

      onChange(state)
    }

    updateToolbar() {
      const { toolbar } = this.state
      const { state } = this.props

      if (!toolbar) return

      if (state.isBlurred || !process.browser) {
        toolbar.removeAttribute('style')
        return
      }
      const selection = window.getSelection()
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      toolbar.style.opacity = 1
      toolbar.style.top = `${rect.top}px`
    }

    renderBlockButton(type, icon) {
      const isActive = this.hasBlock(type)
      const onMouseDown = e =>
        this.clickBlockHandler(e, type)

      return (
        <span
          className="button"
          key={type}
          onMouseDown={onMouseDown}
          data-active={isActive}
        >
          <span>
            {icon}
          </span>
        </span>
      )
    }

    render() {
      return (
        <Portal isOpened onOpen={this.openHandler}>
          <div {...css(styles.hoverToolbar)}>
            {blocks.map(([type, icon]) =>
              this.renderBlockButton(type, icon)
            )}
          </div>
        </Portal>
      )
    }
  }
  Toolbar.propTypes = {
    state: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  }

  return Toolbar
}
