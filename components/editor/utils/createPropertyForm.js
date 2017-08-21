import React from 'react'
import PropTypes from 'prop-types'

const propTypes = {
  state: PropTypes.object.isRequired,
  onClaimLock: PropTypes.func,
  onReleaseLock: PropTypes.func
}

export default ({
  isDisabled
}) =>
  Component => {
    const PropertyForm = props =>
      <Component
        disabled={isDisabled(props)}
        {...props}
      />

    PropertyForm.propTypes = propTypes

    return PropertyForm
  }
