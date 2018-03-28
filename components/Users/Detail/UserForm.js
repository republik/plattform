import React, { Component } from 'react'
import { Button } from '@project-r/styleguide'
import AddressFieldSet from './AddressFieldSet'
import ParticularsFieldSet from './ParticularsFieldSet'

const hasErrors = state =>
  Object.keys(state.errors).some(
    fieldName =>
      !state.errors ? false : !!state.errors[fieldName]
  )

const isDirty = state =>
  Object.keys(state.dirty).some(
    fieldName =>
      !state.dirty ? false : !!state.dirty[fieldName]
  )

const cleanAddress = ({
  name,
  line1,
  line2,
  postalCode,
  city,
  country
}) => ({
  name,
  line1,
  line2,
  postalCode,
  city,
  country
})

const cleanUser = ({
  id,
  name,
  firstName,
  lastName,
  phoneNumber,
  birthday,
  address
}) => ({
  id,
  name,
  firstName,
  lastName,
  phoneNumber,
  birthday,
  address
})

const mergeStates = (stateA, stateB) => ({
  values: {
    ...stateA.values,
    ...stateB.values
  },
  dirty: {
    ...stateA.dirty,
    ...stateB.dirty
  },
  errors: {
    ...stateA.errors,
    ...stateB.errors
  }
})

const getInitialState = props => ({
  user: {
    values: props.user || {},
    dirty: {},
    errors: {}
  },
  address: {
    values: props.user.address || {},
    dirty: {},
    errors: {}
  }
})

export default class UserForm extends Component {
  constructor(props) {
    super(props)
    this.state = getInitialState(props)
  }

  userChangeHandler = userFieldState => {
    this.setState(() => ({
      ...this.state,
      ...{
        user: mergeStates(this.state.user, userFieldState)
      }
    }))
  }

  addressChangeHandler = addressFieldState => {
    this.setState(() => ({
      ...this.state,
      ...{
        address: mergeStates(
          this.state.address,
          addressFieldState
        )
      }
    }))
  }

  submitHandler = event => {
    event.preventDefault()
    if (this.props.onSubmit) {
      this.props.onSubmit({
        ...cleanUser(this.state.user.values),
        ...{
          address: cleanAddress(this.state.address.values)
        }
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => getInitialState(nextProps))
  }

  render() {
    const dirty =
      isDirty(this.state.user) ||
      isDirty(this.state.address)

    const error =
      hasErrors(this.state.user) ||
      hasErrors(this.state.address)

    return (
      <form onSubmit={this.submitHandler}>
        <ParticularsFieldSet
          onChange={this.userChangeHandler}
          {...this.state.user}
        />
        <AddressFieldSet
          onChange={this.addressChangeHandler}
          {...this.state.address}
        />
        <Button
          primary
          type="submit"
          disabled={!dirty || error}
        >
          ändern
        </Button>
      </form>
    )
  }
}
