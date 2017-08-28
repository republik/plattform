import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Placeholder extends Component {
  isVisible (node, state) {
    return !node.text && !state.selection.hasEdgeIn(node) && !state.isBlurred
  }

  clickHandler (e) {
    e.preventDefault()
    const { state, node, editor } = this.props
    editor.onChange(
      state.transform()
        .select({ anchorKey: node.nodes.first().key, focusKey: node.nodes.first().key, anchorOffset: 0, focusOffset: 0 })
        .focus()
        .apply())
  }

  shouldComponentUpdate (nextProps) {
    const { state, node } = this.props
    return state !== nextProps.state && node !== nextProps.node
  }

  render () {
    const { children, state, editor, node, ...props } = this.props

    if (!this.isVisible(node, state)) {
      return null
    }

    const onMouseDown = e => this.clickHandler(e)

    return (
      <span
        onMouseDown={onMouseDown}
        contentEditable={false}
        {...props}
      >
        {children}
      </span>
    )
  }
}

Placeholder.propTypes = {
  node: PropTypes.object.isRequired,
  state: PropTypes.object.isRequired,
  editor: PropTypes.object.isRequired
}

export default Placeholder
