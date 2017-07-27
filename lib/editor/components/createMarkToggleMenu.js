import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default marks => {
  class Menu extends Component {
    constructor(props) {
      super(props)
      this.clickMarkHandler = this.clickMarkHandler.bind(
        this
      )
    }

    hasMark(type) {
      const { state } = this.props
      return state.marks.some(mark => mark.type === type)
    }

    clickMarkHandler(e, type) {
      e.preventDefault()
      let { state, onChange } = this.props
      state = state.transform().toggleMark(type).apply()

      onChange(state)
    }

    renderMarkButton(type, icon) {
      const isActive = this.hasMark(type)
      const onMouseDown = e =>
        this.clickMarkHandler(e, type)

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
        <span className="menu">
          {marks.map(([type, icon]) =>
            this.renderMarkButton(type, icon)
          )}
        </span>
      )
    }
  }
  Menu.propTypes = {
    state: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  }

  return Menu
}
