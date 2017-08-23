import React from 'react'
import PropTypes from 'prop-types'

const preventDefault = event => event.preventDefault()

const propTypes = {
  state: PropTypes.object.isRequired,
  onChange: PropTypes.func
}

const defaultProps = {
  onChange: () => true
}

export default ({
  isDisabled,
  reducer
}) =>
  Component => {
    const ActionButton = props => {
      const { state, onChange, ...propsToPass } = props
      const disabled = isDisabled(props)
      const onMouseDown = !disabled
      ? reducer(props)
      : preventDefault
      return (
        <Component
          {...propsToPass}
          disabled={disabled}
          onMouseDown={onMouseDown}
      />
      )
    }
    ActionButton.propTypes = propTypes
    ActionButton.defaultProps = defaultProps

    return ActionButton
  }
