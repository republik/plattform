import { Component } from 'react';
import AddressForm, { COUNTRIES } from '../Account/AddressForm'
import FieldSet from '../FieldSet'
import { gql } from '@apollo/client'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { Button, InlineSpinner, Interaction } from '@project-r/styleguide'
import ErrorMessage, { ErrorContainer } from '../ErrorMessage'
import Loader from '../Loader'
import withT from '../../lib/withT'
import voteT from './voteT'

const DEFAULT_COUNTRY = COUNTRIES[0]

class AddressEditor extends Component {
  constructor(props) {
    super(props)
    this.state = {
      errors: {},
      dirty: {},
      ...this.deriveStateFromProps(props),
    }
  }

  deriveStateFromProps({ addressData }) {
    const { name: meName, address } = addressData.voteMe || {}
    const name = (address && address.name) || meName
    const {
      line1,
      line2,
      city,
      postalCode,
      country = DEFAULT_COUNTRY,
    } = address || {}
    return {
      values: {
        name,
        line1,
        line2,
        city,
        postalCode,
        country,
      },
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      nextProps.addressData.voteMe &&
      nextProps.addressData.voteMe !== this.props.addressData.voteMe
    ) {
      this.setState(this.deriveStateFromProps(nextProps))
    }
  }

  render() {
    const { addressData, t, vt } = this.props
    const { values, errors, error, dirty, updating, showErrors } = this.state
    const isValid = !Object.keys(errors).some((k) => Boolean(errors[k]))

    const save = () => {
      if (!isValid) {
        this.setState({ showErrors: true })
        return
      }

      this.setState({ updating: true })

      this.props
        .updateAddress(values)
        .then(() =>
          this.setState(() => ({
            updating: false,
            error: null,
          })),
        )
        .catch((error) => {
          this.setState(() => ({
            updating: false,
            error,
          }))
        })
    }

    return (
      <Loader
        loading={addressData.loading}
        error={addressData.error}
        render={() => (
          <div style={{ marginTop: 30 }}>
            <Interaction.P>{vt('common/missingAddressBody')}</Interaction.P>
            <AddressForm
              values={values}
              errors={errors}
              dirty={dirty}
              onChange={(fields) => {
                this.setState(FieldSet.utils.mergeFields(fields))
              }}
            />
            {error && <ErrorMessage error={error} />}
            {!isValid && showErrors && (
              <ErrorContainer>
                {vt('info/candidacy/missingFields')}
                <ul style={{ marginTop: 10 }}>
                  {Object.keys(errors).map(
                    (k) => !!errors[k] && <li key={k}>{errors[k]}</li>,
                  )}
                </ul>
              </ErrorContainer>
            )}
            <Button primary={isValid} onClick={save}>
              {updating ? (
                <InlineSpinner size={40} />
              ) : (
                t('Account/Update/submit')
              )}
            </Button>
          </div>
        )}
      />
    )
  }
}

const updateAddressMutation = gql`
  mutation updateAddress($address: AddressInput) {
    updateMe(address: $address) {
      id
      address {
        name
        line1
        line2
        postalCode
        city
        country
      }
    }
  }
`

const query = gql`
  query VoteAddressEditor {
    voteMe: me {
      id
      name
      address {
        name
        line1
        line2
        postalCode
        city
        country
      }
    }
  }
`

export const withAddressData = graphql(query, { name: 'addressData' })

export default compose(
  withT,
  voteT,
  graphql(updateAddressMutation, {
    props: ({ mutate }) => ({
      updateAddress: (address) => {
        return mutate({
          variables: {
            address,
          },
        })
      },
    }),
  }),
  withAddressData,
)(AddressEditor)
