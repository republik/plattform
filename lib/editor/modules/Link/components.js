import { Component, createElement } from 'react'
import PropTypes from 'prop-types'

const LinkButton = get => {
  class LinkButton extends Component {
    isDisabled () {
      const { state } = this.props
      return state.isBlurred ||
        (
          state.isEmpty &&
          !this.hasLinks()
        )
    }

    hasLinks () {
      const { state } = this.props
      return state.inlines.some(
        inline => inline.type === get('Link.Constants.LINK')
      )
    }

    clickHandler (e) {
      e.preventDefault()
      let { state, onChange } = this.props
      const hasLinks = this.hasLinks()

      if (hasLinks) {
        state = state.transform().unwrapInline(get('Link.Constants.LINK')).apply()
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
            type: get('Link.Constants.LINK'),
            data: { href }
          })
          .collapseToEnd()
          .apply()
        return onChange(state)
      }
    }

    render () {
      const hasLinks = this.hasLinks()
      const isDisabled = this.isDisabled()
      const onMouseDown = !isDisabled
        ? e => this.clickHandler(e)
        : e => e.preventDefault()
      return createElement(get('Link.UI.Button'), {
        onMouseDown,
        'data-active': hasLinks,
        'data-disabled': isDisabled
      })
    }
  }

  LinkButton.propTypes = {
    state: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  }

  return LinkButton
}

export default get => ({
  LinkButton: LinkButton(get)
})
