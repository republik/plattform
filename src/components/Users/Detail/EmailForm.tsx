import * as React from 'react'
import { Label, Field, Button, Interaction } from '@project-r/styleguide'
import { validate as isEmail } from 'email-validator'
import { User } from '../../../types/admin'

export interface EmailFormProps {
  user: User
  onSubmit: (user: User) => void
}

export interface EmailFormState {
  user: any
  isDirty: boolean
  error?: string | boolean
}

const getInitialState = (props: EmailFormProps): EmailFormState => ({
  user: props.user,
  isDirty: false
})

export default class EmailForm extends React.Component<
  EmailFormProps,
  EmailFormState
> {
  constructor(props: EmailFormProps) {
    super(props)
    this.state = getInitialState(props)
  }

  public emailChangeHandler = (event: any, value: string) =>
    this.setState(() => ({
      isDirty: true,
      user: {
        ...this.state.user,
        ...{ email: value }
      },
      error:
        (value.trim().length <= 0 && `That's not an email address at all.`) ||
        (!isEmail(value) && `That's not a valid email address.`)
    }))

  public submitHandler = (onSubmit: (user: User) => void) => (
    event: any
  ): void => {
    event.preventDefault()
    const { user } = this.state
    if (
      confirm(
        `Sure about that?
        ${user.firstName} will get a message to ${user.email}...`
      )
    ) {
      onSubmit(user)
    }
  }

  public componentWillReceiveProps(nextProps: EmailFormProps) {
    this.setState(() => getInitialState(nextProps))
  }

  public render() {
    const { onSubmit } = this.props

    const user = this.state.isDirty ? this.state.user : this.props.user
    const { email } = user

    return (
      <form onSubmit={this.submitHandler(onSubmit)}>
        <Interaction.H3>E-Mail-Adresse</Interaction.H3>
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
