import React, { Component } from 'react'
import PropTypes from 'prop-types'

const createMarkButton = get => type => {
  class MarkButton extends Component {
    hasMark () {
      const { state } = this.props
      return state.marks.some(mark => mark.type === type)
    }

    clickHandler (e) {
      e.preventDefault()
      let { state, onChange } = this.props
      state = state.transform().toggleMark(type).apply()

      onChange(state)
    }

    render () {
      const isActive = this.hasMark()
      const onMouseDown = e => this.clickHandler(e)
      const Button = get(`Typography.UI.MarkButton.${type}`)

      return (
        <Button
          onMouseDown={onMouseDown}
          data-active={isActive}
          active={isActive}
        />
      )
    }
  }
  MarkButton.propTypes = {
    state: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  }

  return MarkButton
}

const createBlockButton = get => type => {
  class BlockButton extends Component {
    hasBlock () {
      const { state } = this.props
      return state.blocks.some(block => block.type === type)
    }

    clickHandler (e) {
      e.preventDefault()
      let { state, onChange } = this.props
      state = state.transform().setBlock(type).apply()

      onChange(state)
    }

    render () {
      const isActive = this.hasBlock()
      const onMouseDown = e => this.clickHandler(e)
      const Button = get(
        `Typography.UI.BlockButton.${type}`
      )

      return (
        <Button
          onMouseDown={onMouseDown}
          data-active={isActive}
          active={isActive}
        />
      )
    }
  }
  BlockButton.propTypes = {
    state: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  }

  return BlockButton
}

export default get => ({
  createMarkButton: createMarkButton(get),
  createBlockButton: createBlockButton(get)
})
