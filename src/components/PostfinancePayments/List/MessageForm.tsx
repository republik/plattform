import * as React from 'react'

export interface MessageFormProps {
  message: string
  onSubmit: (message: string) => void
}

export interface MessageFormState {
  message: any
  isDirty: boolean
  error?: string | boolean
}

const getInitialState = (
  props: MessageFormProps
): MessageFormState => ({
  message: props.message,
  isDirty: false
})

export default class EmailForm extends React.Component<
  MessageFormProps,
  MessageFormState
> {
  constructor(props: MessageFormProps) {
    super(props)
    this.state = getInitialState(props)
  }

  public messageChangeHandler = (event: any) => {
    const value = event.target.value
    this.setState(() => ({
      isDirty: true,
      message: value,
      error: value.trim().length <= 0 && `No empty message.`
    }))
  }

  public submitHandler = (
    onSubmit: (message: string) => void
  ) => (event: any): void => {
    event.preventDefault()

    onSubmit(this.state.message)
  }

  public componentWillReceiveProps(
    nextProps: MessageFormProps
  ) {
    this.setState(() => getInitialState(nextProps))
  }

  public render() {
    const { onSubmit } = this.props

    const message = this.state.isDirty
      ? this.state.message
      : this.props.message

    return (
      <form onSubmit={this.submitHandler(onSubmit)}>
        <input
          type=""
          value={message || ''}
          onChange={this.messageChangeHandler}
        />
        <button
          type="submit"
          disabled={
            !this.state.isDirty || !!this.state.error
          }
        >
          Save
        </button>
      </form>
    )
  }
}
