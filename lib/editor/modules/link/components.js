import React, { Component } from 'react'
import PropTypes from 'prop-types'
import constants from './constants'

const LinkButton = ({ Link }) => {
  class LinkButton extends Component {
    hasLinks() {
      const { state } = this.props
      return state.inlines.some(
        inline => inline.type === constants.LINK
      )
    }

    clickHandler(e) {
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
      const onMouseDown = e => this.clickHandler(e)
      return (
        <Link.UI.Button
          onMouseDown={onMouseDown}
          data-active={hasLinks}
          active={hasLinks}
        />
      )
    }
  }

  LinkButton.propTypes = {
    state: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  }

  return LinkButton
}

export default opts => ({
  LinkButton: LinkButton(opts)
})
