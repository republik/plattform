import React from 'react'
import PropTypes from 'prop-types'

const preventDefault = event => event.preventDefault()

const propTypes = {
  state: PropTypes.object.isRequired,
  onChange: PropTypes.func
}

export default ({
  isDisabled,
  isActive,
  reducer
}) =>
  Component => {
    const FormatButton = props => {
      const disabled = isDisabled(props)
      const active = isActive(props)
      const onMouseDown = !disabled
      ? reducer(props)
      : preventDefault
      return (
        <Component
          {...props}
          active={active}
          disabled={disabled}
          onMouseDown={onMouseDown}
      />
      )
    }
    FormatButton.propTypes = propTypes

    return FormatButton
  }
