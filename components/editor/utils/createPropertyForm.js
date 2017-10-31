import React from 'react'
import PropTypes from 'prop-types'

const propTypes = {
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func
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
