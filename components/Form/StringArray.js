import React, { Component } from 'react'
import Input from './Input'

export const parse = str => {
  if (!str) {
    return
  }

  const [field, stringArray] = str.split(';)')
  const values = stringArray.split(',')
  return { field: field.toString(), values }
}

export const serialize = ({ field, values }) =>
  `${field};)${values.join(',')}`

const getInitialState = ({ stringArray, ...props }) =>
  stringArray
    ? { stringArray, enabled: true }
    : {
        enabled: false,
        stringArray: {
          field: props.fields[0][0],
          values: []
        }
      }

export class Form extends Component {
  constructor(props) {
    super(props)
    this.state = getInitialState(props)
  }

  fieldChangeHandler = event => {
    const field = event.target.value
    this.setState(
      () => ({
        ...this.state,
        stringArray: {
          values: [],
          field
        }
      }),
      this.emitChange
    )
  }

  enabledChangeHandler = event => {
    const enabled = event.target.checked

    this.setState(
      () => ({
        ...this.state,
        enabled
      }),
      this.emitChange
    )
  }

  choiceChangeHandler = event => {
    const value = event.target.value
    const checked = event.target.checked
    const oldValues = this.state.stringArray.values
    const cleanValues = oldValues.filter(v => v !== value)
    const values = checked
      ? [value, ...cleanValues]
      : cleanValues
    this.setState(
      () => ({
        ...this.state,
        stringArray: {
          ...this.state.stringArray,
          values
        }
      }),
      this.emitChange
    )
  }

  emitChange = () => {
    if (this.props.onChange) {
      const {
        enabled,
        stringArray: { field, values }
      } = this.state
      this.props.onChange(
        enabled && values.length > 0
          ? {
              field,
              values
            }
          : undefined
      )
    }
  }

  willReceiveProps(nextProps) {
    this.setState(() => getInitialState(nextProps))
  }

  render() {
    const { fields } = this.props
    const {
      enabled,
      stringArray: { field, values }
    } = this.state
    const selectedField = fields.find(
      v => v && v[0] === field
    )

    return (
      <div>
        <Input
          type="checkbox"
          checked={enabled}
          label="Filter"
          onChange={this.enabledChangeHandler}
        />
        {fields.length > 1 ? (
          <select
            value={field}
            disabled={!enabled}
            onChange={this.fieldChangeHandler}
          >
            {fields.map(fieldTuple => (
              <option
                key={fieldTuple[0]}
                value={fieldTuple[0]}
              >
                {fieldTuple[0]}
              </option>
            ))}
          </select>
        ) : null}
        {selectedField
          ? selectedField[1].map(choice => (
              <Input
                type="checkbox"
                key={choice}
                label={choice}
                value={choice}
                checked={values.indexOf(choice) >= 0}
                onChange={this.choiceChangeHandler}
              />
            ))
          : null}
      </div>
    )
  }
}

export default {
  Form,
  parse,
  serialize
}
