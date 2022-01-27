import React, { Component } from 'react'
import Input from './Input'

export const parse = str => {
  if (!str) {
    return
  }
  const [field, v] = str.split('_')
  return {
    field: field.toString(),
    value: v === 'true'
  }
}

export const serialize = ({ field, value }) =>
  `${field}_${value.toString()}`

const getInitialState = ({ bool, ...props }) =>
  bool
    ? { bool, enabled: true }
    : {
        enabled: false,
        bool: {
          field: props.fields[0],
          value: false
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
        bool: {
          ...this.state.bool,
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

  changeHandler = event => {
    const value = event.target.checked
    this.setState(
      () => ({
        ...this.state,
        bool: {
          ...this.state.bool,
          value
        }
      }),
      this.emitChange
    )
  }

  emitChange = () => {
    if (this.props.onChange) {
      const { enabled, bool: { field, value } } = this.state
      this.props.onChange(
        enabled
          ? {
              field,
              value
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
    const { enabled, bool: { field, value } } = this.state

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
            {fields.map(fieldName => (
              <option key={fieldName} value={fieldName}>
                {fieldName}
              </option>
            ))}
          </select>
        ) : null}
        <Input
          label={field}
          type="checkbox"
          disabled={!enabled}
          onChange={this.changeHandler}
          checked={value}
        />
      </div>
    )
  }
}

export default {
  Form,
  parse,
  serialize
}
