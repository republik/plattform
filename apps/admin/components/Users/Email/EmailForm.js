import { Button } from '@/components/ui'
import { errorToString } from '@/lib/utils/errors'
import { Field } from '@project-r/styleguide'
import { Component } from 'react'
import isEmail from 'validator/lib/isEmail'

const getInitialState = ({ user, error }) => ({
  id: user.id,
  email: user.email,
  isDirty: false,
  error: error ? errorToString(error) : false,
})

export default class EmailForm extends Component {
  constructor(props) {
    super(props)
    this.state = getInitialState(props)

    this.emailChangeHandler = (event, value) =>
      this.setState(() => ({
        isDirty: true,
        email: value,
        error:
          (value.trim().length <= 0 || !isEmail(value)) &&
          `Das ist keine gültige E-Mail Adresse.`,
      }))

    this.submitHandler = (onSubmit) => (event) => {
      event.preventDefault()
      const { email, id } = this.state
      if (window.confirm(`Bist du sicher? ${email} wird benachrichtigt.`)) {
        onSubmit({ email, id })
      }
    }
  }

  render() {
    const { onSubmit } = this.props

    const email = this.state.isDirty ? this.state.email : this.props.user.email

    return (
      <form onSubmit={this.submitHandler(onSubmit)}>
        <Field
          error={this.state.error}
          value={email}
          label='E-Mail'
          onChange={this.emailChangeHandler}
        />
        <Button
          type='submit'
          disabled={!this.state.isDirty || this.state.error}
        >
          ändern
        </Button>
      </form>
    )
  }
}
