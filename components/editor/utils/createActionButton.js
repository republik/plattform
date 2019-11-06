import React from 'react'
import PropTypes from 'prop-types'

const preventDefault = event => event.preventDefault()

const propTypes = {
  onChange: PropTypes.func,
  isDisabled: PropTypes.func,
  isVisible: PropTypes.func
}

const defaultProps = {
  onChange: () => true
}

export default ({
  isDisabled = () => false,
  isVisible = () => true,
  reducer
}) => Component => {
  const ActionButton = props => {
    const {
      onChange,
      isDisabled: propsIsDisabled,
      isVisible: propsIsVisible,
      ...propsToPass
    } = props
    const visible = propsIsVisible
      ? propsIsVisible(props, isVisible(props))
      : isVisible(props)
    const disabled = propsIsDisabled
      ? propsIsDisabled(props, isDisabled(props))
      : isDisabled(props)
    const onMouseDown = !disabled ? reducer(props) : preventDefault
    return (
      <Component
        {...propsToPass}
        disabled={disabled}
        visible={visible}
        onMouseDown={onMouseDown}
      />
    )
  }
  ActionButton.propTypes = propTypes
  ActionButton.defaultProps = defaultProps

  return ActionButton
}
