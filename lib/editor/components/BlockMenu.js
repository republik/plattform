import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class BlockMenu extends Component {
  constructor(props) {
    super(props)
    this.clickBlockHandler = this.clickBlockHandler.bind(
      this
    )
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

  renderBlockButton(type, icon) {
    const isActive = this.hasBlock(type)
    const onMouseDown = e => this.clickBlockHandler(e, type)
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
    const { blocks } = this.props

    return (
      <span className="menu">
        {blocks.map(([type, icon]) =>
          this.renderBlockButton(type, icon)
        )}
      </span>
    )
  }
}
BlockMenu.propTypes = {
  blocks: PropTypes.array.isRequired,
  state: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
}
