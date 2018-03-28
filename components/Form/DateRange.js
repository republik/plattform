import React, { Component } from 'react'
import Input from './Input'
import moment from 'moment'

const standardDate = (rawDate?): string =>
  moment(rawDate).format('YYYY-MM-DD')

const localDate = (rawDate?): string =>
  moment(rawDate).format('YYYY-MM-DD')

export const parse = str => {
  if (!str) {
    return
  }

  const [field, dateRange] = str.split('_')
  const [from, to] = dateRange.split(':')
  return { field: field.toString(), from, to }
}

export const serialize = ({ field, from, to }): string =>
  `${field}_${from}:${to}`

const getInitialState = ({ dateRange, ...props }) =>
  dateRange
    ? { dateRange, enabled: true }
    : {
        enabled: false,
        dateRange: {
          field: props.fields[0],
          from: standardDate('2017-04-20'),
          to: standardDate({})
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
        dateRange: {
          ...this.state.dateRange,
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

  dateChangeHandler = (fieldName: string) => event => {
    const value = event.target.value
    this.setState(
      () => ({
        ...this.state,
        dateRange: {
          ...this.state.dateRange,
          [fieldName]: value
        }
      }),
      this.emitChange
    )
  }

  emitChange = () => {
    if (this.props.onChange) {
      const {
        enabled,
        dateRange: { field, from, to }
      } = this.state
      this.props.onChange(
        enabled
          ? {
              field,
              from: localDate(from),
              to: localDate(to)
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
      dateRange: { field, from, to }
    } = this.state

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
          label="From"
          type="date"
          disabled={!enabled}
          onChange={this.dateChangeHandler('from')}
          value={from}
        />
        <Input
          label="Until"
          type="date"
          disabled={!enabled}
          onChange={this.dateChangeHandler('to')}
          value={to}
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
