import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Link from 'react-icons/lib/md/link'

export default class LinkMenu extends Component {
  constructor(props) {
    super(props)
    this.linkClickHandler = this.linkClickHandler.bind(this)
  }

  hasLinks() {
    const { state } = this.props
    return state.inlines.some(inline => inline.type === 'a')
  }

  linkClickHandler(e) {
    e.preventDefault()
    let { state, onChange } = this.props
    const hasLinks = this.hasLinks()

    if (hasLinks) {
      state = state.transform().unwrapInline('a').apply()
      return onChange(state)
    } else if (state.isExpanded) {
      const href = window.prompt(
        'Enter the URL of the link:'
      )
      if (!href) {
        return
      }
      state = state
        .transform()
        .wrapInline({
          type: 'a',
          data: { href }
        })
        .collapseToEnd()
        .apply()
      return onChange(state)
    }
  }

  render() {
    const hasLinks = this.hasLinks()
    return (
      <span className="menu">
        <span
          className="button"
          onMouseDown={this.linkClickHandler}
          data-active={hasLinks}
        >
          <span>
            <Link />
          </span>
        </span>
      </span>
    )
  }
}

LinkMenu.propTypes = {
  state: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
}
