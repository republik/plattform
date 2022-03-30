import { Component, Fragment } from 'react';
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import {
  Button,
  Overlay,
  OverlayBody,
  OverlayToolbar,
  Loader,
  FieldSet,
} from '@project-r/styleguide'

import { TextButton } from '../../Display/utils'

import AddressFieldSet from '../Particulars/AddressFieldSet'

const MUTATION = gql`
  mutation updateAddress($id: ID!, $address: AddressInput!) {
    updateAddress(id: $id, address: $address) {
      id
      name
      line1
      line2
      postalCode
      city
      country
    }
  }
`

export default class UpdateAddress extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isOpen: false,
      values: props.address || {},
      dirty: {},
      errors: {},
    }

    this.closeHandler = () => {
      this.setState({ isOpen: false })
    }

    this.submitHandler = (mutation) => () => {
      const { values } = this.state
      return mutation({
        variables: {
          id: this.props.address.id,
          address: {
            name: values.name,
            line1: values.line1,
            line2: values.line2,
            postalCode: values.postalCode,
            city: values.city,
            country: values.country,
          },
        },
      }).then(() => this.setState({ isOpen: false }))
    }
  }

  render() {
    const { isOpen } = this.state
    return (
      <div>
        <TextButton
          onClick={() => {
            this.setState({ isOpen: true })
          }}
        >
          ändern
        </TextButton>

        {isOpen && (
          <Mutation mutation={MUTATION}>
            {(mutate, { loading, error }) => {
              return (
                <Overlay onClose={this.closeHandler}>
                  <OverlayToolbar onClose={this.closeHandler} />
                  <OverlayBody>
                    <Loader
                      loading={loading}
                      error={error}
                      render={() => (
                        <Fragment>
                          <AddressFieldSet
                            onChange={(fields) => {
                              this.setState(FieldSet.utils.mergeFields(fields))
                            }}
                            {...this.state}
                          />
                          <Button primary onClick={this.submitHandler(mutate)}>
                            ändern
                          </Button>
                        </Fragment>
                      )}
                    />
                  </OverlayBody>
                </Overlay>
              )
            }}
          </Mutation>
        )}
      </div>
    )
  }
}
