import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import Field from './Field'

const getErrors = (fields, values) => {
  return fields.reduce((acumulator, { name, validator }) => {
    if (validator) {
      acumulator[name] = validator(values[name])
    }
    return acumulator
  }, {})
}

const fieldsState = ({ field, value, error, dirty }) => ({
  values: {
    [field]: value,
  },
  errors: {
    [field]: error,
  },
  dirty: {
    [field]: dirty,
  },
})

const mergeFields =
  ({ values, errors, dirty }) =>
  (state) => ({
    values: {
      ...state.values,
      ...values,
    },
    errors: {
      ...state.errors,
      ...errors,
    },
    dirty: {
      ...state.dirty,
      ...dirty,
    },
  })

const mergeField = (field) => (state) => mergeFields(fieldsState(field))(state)

class FieldSet extends Component {
  componentDidMount() {
    const { fields, values: initialValues, onChange } = this.props

    const values = fields.reduce((acumulator, { name }) => {
      acumulator[name] = initialValues[name] || ''
      return acumulator
    }, {})
    const errors = getErrors(fields, values)

    onChange(
      {
        values,
        errors,
      },
      true,
    )
  }
  render() {
    const { fields, values, errors, dirty, onChange, additionalFieldProps } =
      this.props
    return (
      <Fragment>
        {fields.map((field) => {
          const {
            label,
            type,
            autoComplete,
            required,
            name,
            validator,
            explanation,
          } = field

          return (
            <Fragment key={name}>
              <Field
                label={label}
                type={type}
                name={autoComplete || name}
                autoComplete={autoComplete}
                required={required}
                {...additionalFieldProps(field)}
                value={values[name] ?? ''}
                error={dirty[name] && errors[name]}
                onChange={(_, value, shouldValidate) => {
                  onChange({
                    values: {
                      [name]: value,
                    },
                    errors: validator
                      ? {
                          [name]: validator(value),
                        }
                      : {},
                    dirty: {
                      [name]: shouldValidate,
                    },
                  })
                }}
              />
              {explanation}
            </Fragment>
          )
        })}
      </Fragment>
    )
  }
}

FieldSet.propTypes = {
  additionalFieldProps: PropTypes.func.isRequired,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string,
      validator: PropTypes.func,
      autoComplete: PropTypes.string,
      explanation: PropTypes.node,
    }),
  ).isRequired,
  onFieldChange: PropTypes.func,
}

FieldSet.defaultProps = {
  additionalFieldProps: () => {},
}

FieldSet.utils = {
  fieldsState,
  getErrors,
  mergeFields,
  mergeField,
}

export default FieldSet
