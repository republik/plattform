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
  isActive,
  reducer
}) =>
  Component => {
    const FormatButton = props => {
      const { state, onChange, ...propsToPass } = props
      const disabled = isDisabled(props)
      const active = isActive(props)
      const onMouseDown = !disabled
      ? reducer(props)
      : preventDefault
      return (
        <Component
          {...propsToPass}
          active={active}
          disabled={disabled}
          onMouseDown={onMouseDown}
      />
      )
    }
    FormatButton.propTypes = propTypes
    FormatButton.defaultProps = defaultProps

    return FormatButton
  }
