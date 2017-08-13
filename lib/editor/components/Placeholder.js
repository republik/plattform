
import React from 'react'
import Types from 'prop-types'

/**
 * Placeholder.
 *
 * @type {Component}
 */

class Placeholder extends React.Component {
  /**
   * Is the placeholder visible?
   *
   * @return {Boolean}
   */

  isVisible () {
    const { node, state } = this.props
    if (node.text || (state.selection.hasEdgeIn(node) && !state.isBlurred)) {
      return false
    }
    return true
  }

  /**
   * Render.
   *
   * If the placeholder is a string, and no `className` or `style` has been
   * passed, give it a default style of lowered opacity.
   *
   * @return {Element}
   */

  clickHandler (e) {
    e.preventDefault()
    const { state, node, editor } = this.props
    editor.onChange(
      state.transform()
        .select({ anchorKey: node.nodes.first().key, focusKey: node.nodes.first().key, anchorOffset: 0, focusOffset: 0 })
        .focus()
        .apply())
  }

  render () {
    const isVisible = this.isVisible()
    if (!isVisible) return null

    const { children, className } = this.props
    let { style } = this.props

    if (typeof children === 'string' && style == null && className == null) {
      style = { opacity: '0.333' }
    } else if (style == null) {
      style = {}
    }
    const onMouseDown = e => this.clickHandler(e)

    return (
      <span onMouseDown={onMouseDown} contentEditable={false} className={className} style={style}>
        {children}
      </span>
    )
  }
}

/**
 * Property types.
 *
 * @type {Object}
 */

Placeholder.propTypes = {
  children: Types.any.isRequired,
  className: Types.string,
  node: Types.object.isRequired,
  state: Types.object.isRequired,
  editor: Types.object.isRequired,
  style: Types.object
}

/**
 * Default properties.
 *
 * @type {Object}
 */

Placeholder.defaultProps = {
  firstOnly: true
}

/**
 * Export.
 *
 * @type {Component}
 */

export default Placeholder
