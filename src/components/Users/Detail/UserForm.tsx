import * as React from 'react'
import { Label, Field, Button } from '@project-r/styleguide'
import { User, Address } from '../../../types/admin'
import AddressFieldSet from './AddressFieldSet'
import ParticularsFieldSet from './ParticularsFieldSet'
import { FieldSetState } from '../../Form/FieldSet'

export interface UserFormProps {
  user: User
  onSubmit: (user: any) => void
}

export interface UserFormState {
  user: FieldSetState
  address: FieldSetState
}

const hasErrors = (state: FieldSetState): boolean =>
  Object.keys(state.errors).some(
    (fieldName: string): boolean =>
      !state.errors ? false : !!state.errors[fieldName]
  )

const isDirty = (state: FieldSetState): boolean =>
  Object.keys(state.dirty).some(
    (fieldName: string): boolean =>
      !state.dirty ? false : !!state.dirty[fieldName]
  )

const cleanAddress = ({
  name,
  line1,
  line2,
  postalCode,
  city,
  country
}: any): any => ({
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
  birthDate,
  address
}: any): any => ({
  id,
  name,
  firstName,
  lastName,
  phoneNumber,
  birthDate,
  address
})

const mergeStates = (
  stateA: FieldSetState,
  stateB: FieldSetState
): FieldSetState => ({
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

const getInitialState = (
  props: UserFormProps
): UserFormState => ({
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

export default class UserForm extends React.Component<
  UserFormProps,
  UserFormState
> {
  constructor(props: UserFormProps) {
    super(props)
    this.state = getInitialState(props)
  }

  public userChangeHandler = (
    userFieldState: FieldSetState
  ): void => {
    this.setState(() => ({
      ...this.state,
      ...{
        user: mergeStates(this.state.user, userFieldState)
      }
    }))
  }

  public addressChangeHandler = (
    addressFieldState: FieldSetState
  ): void => {
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

  public submitHandler = (event: any) => {
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

  public componentWillReceiveProps(
    nextProps: UserFormProps
  ): void {
    this.setState(() => getInitialState(nextProps))
  }

  public render() {
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
          Save
        </Button>
      </form>
    )
  }
}
