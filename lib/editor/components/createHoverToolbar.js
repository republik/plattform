import Portal from 'react-portal'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'

const styles = {
  hoverHoverToolbar: {
    padding: '8px 7px 6px',
    position: 'absolute',
    zIndex: 1,
    top: '-10000px',
    left: '-10000px',
    marginTop: '-6px',
    opacity: 0,
    backgroundColor: '#999',
    borderColor: '#222',
    borderRadius: '4px',
    transition: 'opacity .75s',
    '& .button': {
      textAlign: 'center',
      display: 'inline-block',
      minWidth: '10px',
      cursor: 'pointer'
    },
    '& .button[data-active="true"]': {
      backgroundColor: '#fff'
    }
  }
}

export default Menus => {
  class HoverToolbar extends Component {
    constructor(props) {
      super(props)
      this.state = this.getInitialState(this.props)
      this.openHandler = this.openHandler.bind(this)
    }

    getInitialState(props) {
      return { hoverToolbar: false }
    }

    componentDidMount() {
      this.updateHoverToolbar()
    }

    componentDidUpdate() {
      this.updateHoverToolbar()
    }

    openHandler(portal) {
      this.setState({ hoverToolbar: portal.firstChild })
    }

    updateHoverToolbar() {
      const { hoverToolbar } = this.state
      const { state } = this.props

      if (!hoverToolbar) return

      if (state.isBlurred || state.isEmpty) {
        hoverToolbar.removeAttribute('style')
        return
      }
      const selection = window.getSelection()
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      hoverToolbar.style.opacity = 1
      hoverToolbar.style.top = `${rect.top +
        window.scrollY -
        hoverToolbar.offsetHeight}px`
      hoverToolbar.style.left = `${rect.left +
        window.scrollX -
        hoverToolbar.offsetWidth / 2 +
        rect.width / 2}px`
    }

    render() {
      const { state, onChange } = this.props
      return (
        <Portal isOpened onOpen={this.openHandler}>
          <div {...css(styles.hoverHoverToolbar)}>
            {Menus.map((Menu, index) =>
              <Menu
                key={`menu-${index}`}
                state={state}
                onChange={onChange}
              />
            )}
          </div>
        </Portal>
      )
    }
  }
  HoverToolbar.propTypes = {
    state: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  }

  return HoverToolbar
}
