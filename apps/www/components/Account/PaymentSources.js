import { Component, Fragment } from 'react'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'

import withT from '../../lib/withT'
import withMe from '../../lib/apollo/withMe'

import { errorToString } from '../../lib/utils/errors'

import FieldSet from '../FieldSet'
import PaymentForm, { query } from '../Payment/Form'
import { P } from './Elements'

import { Button, InlineSpinner } from '@project-r/styleguide'

import { withRouter } from 'next/router'

import { loadStripe } from '../Payment/stripe'

const objectValues = (object) => Object.keys(object).map((key) => object[key])

class PaymentSources extends Component {
  constructor(...args) {
    super(...args)
    this.state = {
      values: {},
      dirty: {},
      errors: {},
    }
    this.paymentRef = (ref) => {
      this.payment =
        ref && ref.getWrappedInstance ? ref.getWrappedInstance() : ref
    }
  }
  addPaymentMethod() {
    const { t, company } = this.props
    this.setState({
      loading: t('account/paymentSource/saving'),
      remoteError: undefined,
    })
    this.payment.stripe
      .createPaymentMethod()
      .then(async (paymentMethod) => {
        const {
          data: {
            addPaymentMethod: { stripeClientSecret, stripePublishableKey },
          },
        } = await this.props.addPaymentMethod({
          stripePlatformPaymentMethodId: paymentMethod.id,
          companyId: company.id,
        })

        if (stripeClientSecret) {
          const stripeClient = await loadStripe(stripePublishableKey)
          const confirmResult = await stripeClient.confirmCardSetup(
            stripeClientSecret,
          )
          if (confirmResult.error) {
            this.setState(() => ({
              loading: false,
              remoteError: confirmResult.error.message,
            }))
            return
          }
        }
        await this.props.setDefaultPaymentMethod({
          stripePlatformPaymentMethodId: paymentMethod.id,
        })
        this.setState({
          loading: false,
          remoteError: undefined,
          values: {
            paymentSource: paymentMethod.id,
            paymentMethod: 'STRIPE',
          },
          errors: {},
          dirty: {},
        })
      })
      .catch((error) => {
        this.setState({
          loading: false,
          remoteError: errorToString(error),
        })
      })
  }
  render() {
    const { t, me } = this.props
    const { values, errors, dirty, loading, remoteError } = this.state

    const errorMessages = objectValues(errors).filter(Boolean)

    return (
      <Fragment>
        <PaymentForm
          ref={this.paymentRef}
          t={t}
          loadSources
          payload={{
            id: me.id,
          }}
          context='DEFAULT_SOURCE'
          allowedMethods={['STRIPE']}
          onChange={(fields) => {
            this.setState((state) => {
              const nextState = FieldSet.utils.mergeFields(fields)(state)

              if (
                state.values.paymentMethod !== nextState.values.paymentMethod ||
                state.values.paymentSource !== nextState.values.paymentSource
              ) {
                nextState.showErrors = false
                nextState.errors = {}
              }

              return nextState
            })
          }}
          values={values}
          errors={errors}
          dirty={dirty}
        />
        {!!remoteError && (
          <P style={{ color: 'var(--color-error)', marginBottom: 40 }}>
            {remoteError}
          </P>
        )}
        {loading && (
          <div>
            <InlineSpinner />
            <br />
            {loading}
          </div>
        )}
        {!loading && values.newSource && (
          <Fragment>
            {!!this.state.showErrors && errorMessages.length > 0 && (
              <div style={{ color: 'var(--color-error)', marginBottom: 40 }}>
                {t('account/paymentSource/error')}
                <br />
                <ul>
                  {errorMessages.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            <Button
              style={{ opacity: errorMessages.length ? 0.5 : 1 }}
              onClick={() => {
                if (errorMessages.length) {
                  this.setState((state) => {
                    const dirty = {}
                    Object.keys(state.errors).forEach((field) => {
                      if (state.errors[field]) {
                        dirty[field] = true
                      }
                    })
                    return {
                      dirty,
                      showErrors: true,
                    }
                  })
                  return
                }
                this.addPaymentMethod()
              }}
            >
              {t('account/paymentSource/save')}
            </Button>
          </Fragment>
        )}
      </Fragment>
    )
  }
}

const addPaymentMethodMutation = gql`
  mutation addPaymentMethod(
    $stripePlatformPaymentMethodId: ID!
    $companyId: ID!
  ) {
    addPaymentMethod(
      stripePlatformPaymentMethodId: $stripePlatformPaymentMethodId
      companyId: $companyId
    ) {
      stripePublishableKey
      stripeClientSecret
    }
  }
`

const setDefaultPaymentMethodMutation = gql`
  mutation setDefaultPaymentMethod($stripePlatformPaymentMethodId: ID!) {
    setDefaultPaymentMethod(
      stripePlatformPaymentMethodId: $stripePlatformPaymentMethodId
    ) {
      id
      isDefault
      brand
      last4
      expMonth
      expYear
      isExpired
    }
  }
`

export default compose(
  withT,
  withMe,
  withRouter,
  graphql(addPaymentMethodMutation, {
    props: ({ mutate }) => ({
      addPaymentMethod: (variables) => {
        return mutate({
          variables,
        })
      },
    }),
  }),
  graphql(setDefaultPaymentMethodMutation, {
    props: ({ mutate }) => ({
      setDefaultPaymentMethod: (variables) => {
        return mutate({
          variables,
          refetchQueries: [
            {
              query,
            },
          ],
        })
      },
    }),
  }),
)(PaymentSources)
