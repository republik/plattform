import * as React from 'react'
import { css } from 'glamor'
import AutosizeInput from 'react-textarea-autosize'

import { Field } from '@project-r/styleguide'

import MaskedInput from 'react-maskedinput'

export interface FieldConfig {
  label: string
  name: string
  type?: string
  validator?: (...args: any[]) => any
  autoComplete?: string
  mask?: string
}

export interface FieldSetState {
  values?: {
    [key: string]: any
  }
  dirty?: {
    [key: string]: any
  }
  errors?: {
    [key: string]: any
  }
}

export type FieldSetProps = FieldSetState & {
  fields: FieldConfig[]
  onChange: (...args: any[]) => any
}

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

export const getErrors = (fields: any, values: any) => {
  return fields.reduce(
    (acumulator: any, { name, validator }: any) => {
      if (validator) {
        acumulator[name] = validator(values[name])
      }
      return acumulator
    },
    {}
  )
}

export default class FieldSet extends React.Component<
  FieldSetProps,
  any
> {
  public componentDidMount() {
    const {
      fields,
      values: maybeInitialValues,
      onChange
    } = this.props

    const initialValues = maybeInitialValues || {}

    const values = fields.reduce(
      (acumulator: any, { name }: any) => {
        acumulator[name] = initialValues[name] || ''
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

  public render() {
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
          }: any) => {
            const Component = Field
            const additionalProps: any = {}
            if (autoSize) {
              additionalProps.renderInput = (props: any) =>
                <AutosizeInput
                  {...styles.autoSize}
                  {...props}
                />
            }
            if (mask) {
              additionalProps.renderInput = (props: any) =>
                <MaskedInput
                  {...props}
                  {...styles.mask}
                  placeholderChar={maskChar || ' '}
                  mask={mask}
                />
            }
            return (
              <Component
                key={name}
                label={label}
                type={type}
                {...additionalProps}
                name={autoComplete || name}
                autoComplete={autoComplete}
                value={values[name]}
                error={dirty[name] && errors[name]}
                onChange={(
                  _: any,
                  value: any,
                  shouldValidate: any
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
