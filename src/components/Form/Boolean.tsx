import * as React from 'react'
import Input from './Input'

export interface Props {
  fields: string[]
  bool?: Options
  onChange?: (value?: Options) => void
}

export interface State {
  bool: Options
  enabled: boolean
}

export interface Options {
  field: string
  value: boolean
}

export const parse = (
  str?: string
): Options | undefined => {
  if (!str) {
    return
  }

  const [field, v] = str.split('_')
  return { field: field.toString(), value: v === 'true' }
}

export const serialize = ({
  field,
  value
}: Options): string => `${field}_${value.toString()}`

const getInitialState = ({
  bool,
  ...props
}: Props): State =>
  bool
    ? { bool, enabled: true }
    : {
        enabled: false,
        bool: {
          field: props.fields[0],
          value: false
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
        bool: {
          ...this.state.bool,
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

  public changeHandler = (event: any) => {
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

  public emitChange = () => {
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

  public willReceiveProps(nextProps: Props) {
    this.setState(() => getInitialState(nextProps))
  }

  public render() {
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
