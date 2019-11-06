import React from 'react'
import PropTypes from 'prop-types'

const preventDefault = event => event.preventDefault()

const propTypes = {
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func,
  isDisabled: PropTypes.func,
  isActive: PropTypes.func,
  isVisible: PropTypes.func
}

const defaultProps = {
  onChange: () => true
}

export default ({
  isDisabled = () => false,
  isActive = () => false,
  isVisible = () => true,
  reducer
}) => Component => {
  const FormatButton = props => {
    const {
      value,
      onChange,
      isDisabled: propsIsDisabled,
      isActive: propsIsActive,
      isVisible: propsIsVisible,
      ...propsToPass
    } = props
    const visible = propsIsVisible
      ? propsIsVisible(props, isVisible(props))
      : isVisible(props)
    const disabled = propsIsDisabled
      ? propsIsDisabled(props, isDisabled(props))
      : isDisabled(props)
    const active = propsIsActive
      ? propsIsActive(props, isActive(props))
      : isActive(props)
    const onMouseDown = !disabled ? reducer(props) : preventDefault
    return (
      <Component
        {...propsToPass}
        visible={visible}
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
