import React, { Component } from 'react'
import { css } from 'glamor'
import AutosizeInput from 'react-textarea-autosize'

import { Field } from '@project-r/styleguide'

const reqMaskedInput = require('react-maskedinput')
const MaskedInput =
  reqMaskedInput.default || reqMaskedInput

export const styles = {
  mask: css({
    '::placeholder': {
      color: 'transparent'
    },
    ':focus': {
      '::placeholder': {
        color: '#ccc'
      }
    }
  }),
  autoSize: css({
    minHeight: 40,
    paddingTop: '7px !important',
    paddingBottom: '6px !important'
  })
}

export const getErrors = (fields, values) => {
  return fields.reduce(
    (acumulator, { name, validator }) => {
      if (validator) {
        acumulator[name] = validator(values[name])
      }
      return acumulator
    },
    {}
  )
}

export default class FieldSet extends Component {
  componentDidMount() {
    const {
      fields,
      values: maybeInitialValues,
      onChange
    } = this.props

    const initialValues = maybeInitialValues || {}

    const values = fields.reduce(
      (acumulator, { name }) => {
        acumulator[name] =
          initialValues[name] || ''
        return acumulator
      },
      {}
    )
    const errors = getErrors(fields, values)

    onChange(
      {
        values,
        errors
      },
      true
    )
  }

  render() {
    const {
      fields,
      values: maybeValues,
      errors: maybeErrors,
      dirty: maybeDirty,
      onChange
    } = this.props

    const values = maybeValues || {}
    const errors = maybeErrors || {}
    const dirty = maybeDirty || {}

    return (
      <span>
        {fields.map(
          ({
            label,
            type,
            autoComplete,
            name,
            validator,
            mask,
            autoSize,
            maskChar
          }) => {
            const Cmp = Field
            const additionalProps = {}
            if (autoSize) {
              additionalProps.renderInput = props => (
                <AutosizeInput
                  {...styles.autoSize}
                  {...props}
                />
              )
            }
            if (mask) {
              additionalProps.renderInput = props => (
                <MaskedInput
                  {...props}
                  {...styles.mask}
                  placeholderChar={
                    maskChar || ' '
                  }
                  mask={mask}
                />
              )
            }
            return (
              <Cmp
                key={name}
                label={label}
                type={type}
                {...additionalProps}
                name={autoComplete || name}
                autoComplete={autoComplete}
                value={values[name]}
                error={
                  dirty[name] && errors[name]
                }
                onChange={(
                  _,
                  value,
                  shouldValidate
                ) => {
                  onChange({
                    values: {
                      [name]: value
                    },
                    errors: validator
                      ? {
                          [name]: validator(value)
                        }
                      : {},
                    dirty: {
                      [name]: shouldValidate
                    }
                  })
                }}
              />
            )
          }
        )}
      </span>
    )
  }
}
