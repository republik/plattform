import * as React from 'react'
import Input from './Input'
import * as moment from 'moment'

export interface Props {
  fields: string[]
  dateRange?: Options
  onChange?: (value?: Options) => void
}

export interface State {
  dateRange: Options
  enabled: boolean
}

export interface Options {
  field: string
  from: string
  to: string
}

const standardDate = (rawDate?: any): string =>
  moment(rawDate).format('YYYY-MM-DD')

const localDate = (rawDate?: any): string =>
  moment(rawDate).format('YYYY-MM-DD')

export const parse = (
  str?: string
): Options | undefined => {
  if (!str) {
    return
  }

  const [field, dateRange] = str.split('_')
  const [from, to] = dateRange.split(':')
  return { field: field.toString(), from, to }
}

export const serialize = ({
  field,
  from,
  to
}: Options): string => `${field}_${from}:${to}`

const getInitialState = ({
  dateRange,
  ...props
}: Props): State =>
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

export class Form extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = getInitialState(props)
  }

  public fieldChangeHandler = (event: any) => {
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

  public enabledChangeHandler = (event: any) => {
    const enabled = event.target.checked

    this.setState(
      () => ({
        ...this.state,
        enabled
      }),
      this.emitChange
    )
  }

  public dateChangeHandler = (fieldName: string) => (
    event: any
  ) => {
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

  public emitChange = () => {
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

  public willReceiveProps(nextProps: Props) {
    this.setState(() => getInitialState(nextProps))
  }

  public render() {
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
        {fields.length > 1
          ? <select
              value={field}
              disabled={!enabled}
              onChange={this.fieldChangeHandler}
            >
              {fields.map(fieldName =>
                <option key={fieldName} value={fieldName}>
                  {fieldName}
                </option>
              )}
            </select>
          : null}
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
