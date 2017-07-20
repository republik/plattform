import * as React from 'react'
import Input from './Input'

export interface Options {
  field: string
  values: string[]
}

export interface Props {
  fieldName: string
  choices: string[]
  stringArray?: Options
  onChange?: (value?: Options) => void
}

export interface State {
  stringArray: Options
  enabled: boolean
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
          field: props.fieldName,
          values: []
        }
      }

export class Form extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = getInitialState(props)
  }

  public fieldChangeHandler = (event: any) => {
    const choice = event.target.value
    const checked = event.target.value
    const values = checked
      ? [choice, ...this.state.stringArray.values]
      : this.state.stringArray.values.filter(v => v!==choice)

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

  public emitChange = () => {
    if (this.props.onChange) {
      const {
        enabled,
        stringArray: { field, values }
      } = this.state
      this.props.onChange(
        enabled
          ? {
              field,
              values,
            }
          : undefined
      )
    }
  }

  public willReceiveProps(nextProps: Props) {
    this.setState(() => getInitialState(nextProps))
  }

  public render() {
    const { fieldName, choices } = this.props
    const {
      enabled,
      stringArray: { field, values }
    } = this.state

    return (
      <div>
        <Input
          type="checkbox"
          checked={enabled}
          label="Filter"
          onChange={this.enabledChangeHandler}
        />
        {choices.map(choice => (
          <Input type="checkbox"
            checked={values.indexOf(choice) >= 0}
            label={choice}
            value={choice}
            onChange={this.fieldChangeHandler}
          />
        ))}
      </div>
    )
  }
}
