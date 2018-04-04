import React, { Component } from 'react'
import { Field, Button } from '@project-r/styleguide'
import { validate as isEmail } from 'email-validator'
import { errorToString } from '../../../lib/utils/errors'

const getInitialState = props => ({
  user: props.user,
  isDirty: false,
  error: props.error ? errorToString(props.error) : false
})

export default class EmailForm extends Component {
  constructor(props) {
    super(props)
    this.state = getInitialState(props)
  }

  emailChangeHandler = (event, value: string) =>
    this.setState(() => ({
      isDirty: true,
      user: {
        ...this.state.user,
        ...{ email: value }
      },
      error:
        (value.trim().length <= 0 &&
          `That's not an email address at all.`) ||
        (!isEmail(value) &&
          `That's not a valid email address.`)
    }))

  submitHandler = onSubmit => (event): void => {
    event.preventDefault()
    const { user } = this.state
    if (
      confirm(
        `Sure about that?
        ${user.firstName} will get a message to ${
          user.email
        }...`
      )
    ) {
      onSubmit(user)
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => getInitialState(nextProps))
  }

  render() {
    const { onSubmit } = this.props

    const user = this.state.isDirty
      ? this.state.user
      : this.props.user
    const { email } = user

    return (
      <form onSubmit={this.submitHandler(onSubmit)}>
        <Field
          error={this.state.error}
          value={email}
          label="E-Mail"
          onChange={this.emailChangeHandler}
        />
        <Button
          primary
          type="submit"
          disabled={!this.state.isDirty || this.state.error}
        >
          ändern
        </Button>
      </form>
    )
  }
}
