import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Mark } from 'slate'

const createMarkButton = get => type => {
  class MarkButton extends Component {
    isDisabled () {
      const { state } = this.props
      return state.isBlurred ||
        (
          state.isEmpty &&
          !this.hasMark()
        )
    }

    hasMark () {
      const { state } = this.props
      return state.marks.some(mark => mark.type === type)
    }

    toggleMark (state) {
      if (state.isEmpty) {
        const key = state.startKey
        const offset = state.startOffset
        const characters = state.texts.first().characters
        let i = offset
        let has = true
        while (has) {
          i--
          has = characters.get(i).marks.some(mark => mark.type === type)
        }
        const start = i
        i = offset
        has = true
        while (has) {
          i++
          has = characters.get(i).marks.some(mark => mark.type === type)
        }
        const end = i
        const length = end - start
        return state
          .transform()
          .removeMarkByKey(key, start, length, Mark.create({ type }))
          .apply()
      } else {
        return state.transform().toggleMark(type).apply()
      }
    }

    clickHandler (e) {
      e.preventDefault()
      let { state, onChange } = this.props
      onChange(this.toggleMark(state))
    }

    render () {
      const isActive = this.hasMark()
      const isDisabled = this.isDisabled()
      const onMouseDown = !isDisabled
        ? e => this.clickHandler(e)
        : e => e.preventDefault()
      const Button = get(`Typography.UI.MarkButton.${type}`)

      return (
        <Button
          onMouseDown={onMouseDown}
          data-active={isActive}
          data-disabled={isDisabled}
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
    isDisabled () {
      const { state } = this.props
      return state.isBlurred
    }

    hasBlock () {
      const { state } = this.props
      return state.blocks.some(block => block.type === type)
    }

    clickHandler (e) {
      e.preventDefault()
      let { state, onChange } = this.props
      state = state.transform().setBlock(type).focus().apply()

      onChange(state)
    }

    render () {
      const isActive = this.hasBlock()
      const isDisabled = this.isDisabled()
      const onMouseDown = !isDisabled
        ? e => this.clickHandler(e)
        : e => e.preventDefault()
      const Button = get(
        `Typography.UI.BlockButton.${type}`
      )

      return (
        <Button
          onMouseDown={onMouseDown}
          data-active={isActive}
          data-disabled={isDisabled}
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
