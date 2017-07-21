import * as React from 'react'
import Input from './Input'

export type Field = [string, string[]]

export interface Props {
  fields: Field[]
  stringArray?: Options
  onChange?: (value?: Options) => void
}

export interface State {
  stringArray: Options
  enabled: boolean
}

export interface Options {
  field: string
  values: string[]
}

export const parse = (
  str?: string
): Options | undefined => {
  if (!str) {
    return
  }

  const [field, stringArray] = str.split('_')
  const values = stringArray.split(',')
  return { field: field.toString(), values }
}

export const serialize = ({
  field,
  values
}: Options): string => `${field}_${values.join(',')}`

const getInitialState = ({
  stringArray,
  ...props
}: Props): State =>
  stringArray
    ? { stringArray, enabled: true }
    : {
        enabled: false,
        stringArray: {
          field: props.fields[0][0],
          values: []
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
        stringArray: {
          values: [],
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

  public choiceChangeHandler = (event: any) => {
    const value = event.target.value
    const checked = event.target.checked
    const oldValues = this.state.stringArray.values
    const values = checked
      ? [value, ...oldValues]
      : oldValues.filter(v => v !== value)

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

  public emitChange = () => {
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

  public willReceiveProps(nextProps: Props) {
    this.setState(() => getInitialState(nextProps))
  }

  public render() {
    const { fields } = this.props
    const {
      enabled,
      stringArray: { field, values }
    } = this.state
    const selectedField = fields.find(
      (v: Field) => v && v[0] === field
    )

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
              {fields.map(fieldTuple =>
                <option
                  key={fieldTuple[0]}
                  value={fieldTuple[0]}
                >
                  {fieldTuple[0]}
                </option>
              )}
            </select>
          : null}
        {selectedField
          ? selectedField[1].map(choice =>
              <Input
                type="checkbox"
                key={choice}
                label={choice}
                value={choice}
                checked={values.indexOf(choice) >= 0}
                onChange={this.choiceChangeHandler}
              />
            )
          : null}
      </div>
    )
  }
}
