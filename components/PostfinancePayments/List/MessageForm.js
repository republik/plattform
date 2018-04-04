import React, { Component } from 'react'

const getInitialState = props => ({
  message: props.message,
  isDirty: false
})

export default class EmailForm extends Component {
  constructor(props) {
    super(props)
    this.state = getInitialState(props)
  }

  messageChangeHandler = event => {
    const value = event.target.value
    this.setState(() => ({
      isDirty: true,
      message: value,
      error:
        value.trim().length <= 0 &&
        `No empty message.`
    }))
  }

  submitHandler = (
    onSubmit: (message: string) => void
  ) => (event): void => {
    event.preventDefault()

    onSubmit(this.state.message)
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() =>
      getInitialState(nextProps)
    )
  }

  render() {
    const { onSubmit } = this.props

    const message = this.state.message

    return (
      <form
        onSubmit={this.submitHandler(onSubmit)}
      >
        <input
          type=""
          value={message || ''}
          onChange={this.messageChangeHandler}
        />
        <button
          type="submit"
          disabled={
            !this.state.isDirty ||
            !!this.state.error
          }
        >
          Save
        </button>
      </form>
    )
  }
}
