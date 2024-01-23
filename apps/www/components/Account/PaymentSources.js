import { Component, Fragment } from 'react'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'

import withT from '../../lib/withT'
import withMe from '../../lib/apollo/withMe'
import { withDatatransRegistration } from '../Payment/datatrans/withDatatransRegistration'
import { withAddDatatransSource } from '../Payment/datatrans/withAddDatatransSource'
import { isDatatransPaymentMethod } from '../Payment/datatrans/helpers'

import { errorToString } from '../../lib/utils/errors'

import FieldSet from '../FieldSet'
import PaymentForm, { query } from '../Payment/Form'
import { P } from './Elements'

import { Button, InlineSpinner, Loader, colors } from '@project-r/styleguide'

import { withRouter } from 'next/router'

import { loadStripe } from '../Payment/stripe'

const objectValues = (object) => Object.keys(object).map((key) => object[key])

/**
 * Picks payment methods which can be stored as an alias/token. An alias or token
 * is an user authorization to allow charging future payments without their
 * interaction.
 *
 */
const pickTokenizableMethods = (method) =>
  method.startsWith('DATATRANS') || method.startsWith('STRIPE')
class PaymentSources extends Component {
  constructor(...args) {
    super(...args)
    this.state = {
      values: {},
      dirty: {},
      errors: {},
      addingSource: false,
    }
    this.paymentRef = (ref) => {
      this.payment =
        ref && ref.getWrappedInstance ? ref.getWrappedInstance() : ref
    }

    if (this.props.query.paymentSourceId) {
      this.state.addingSource = true
    }
  }

  componentDidMount() {
    if (this.state.addingSource) {
      this.addDatatransSource(this.props.query.paymentSourceId)
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

  registerDatatransPaymentSource() {
    console.log('registerDatatransPaymentSource')
    const { t, company } = this.props

    this.setState({
      loading: t('account/paymentSource/saving'),
      remoteError: undefined,
    })

    this.props
      .datatransRegistration({
        method: this.state.values.paymentMethod,
        companyId: company.id,
      })
      .then(({ data }) => {
        this.payment.datatransForm.action =
          data.datatransRegistration.registrationUrl
        this.payment.datatransForm.submit()
      })
      .catch((error) => {
        this.setState({
          loading: false,
          remoteError: errorToString(error),
        })
      })
  }

  addDatatransSource(paymentSourceId) {
    this.props
      .addDatatransSource({ paymentSourceId })
      /* .then(({ data }) => {
        console.log('addDatatransPaymentMethod.then(data)', data)
      }) */
      .catch((error) => {
        this.setState({
          remoteError: errorToString(error),
        })
      })
      .finally(() => {
        this.props.router.replace({
          query: {},
        })
        this.setState({
          addingSource: false,
        })
      })
  }

  render() {
    const { t, me, methods } = this.props
    const { values, errors, dirty, loading, addingSource, remoteError } =
      this.state

    const errorMessages = objectValues(errors).filter(Boolean)

    if (addingSource) {
      return <Loader loading message={t('account/paymentSource/adding')} />
    }

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
          allowedMethods={methods.filter(pickTokenizableMethods)}
          keepPaymentSource={true}
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
          <P style={{ color: colors.error, marginBottom: 40 }}>{remoteError}</P>
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
              <div style={{ color: colors.error, marginBottom: 40 }}>
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

                if (values.paymentMethod.startsWith('STRIPE')) {
                  this.addPaymentMethod()
                } else if (isDatatransPaymentMethod(values.paymentMethod)) {
                  this.registerDatatransPaymentSource()
                }
              }}
            >
              {isDatatransPaymentMethod(values.paymentMethod)
                ? t('account/paymentSource/register')
                : t('account/paymentSource/save')}
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
  withDatatransRegistration,
  withAddDatatransSource,
)(PaymentSources)
