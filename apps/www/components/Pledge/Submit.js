import React, { Fragment, Component, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import isEmail from 'validator/lib/isEmail'
import Link from 'next/link'

import SignIn, { withSignIn } from '../Auth/SignIn'
import { withSignOut } from '../Auth/SignOut'

import { errorToString } from '../../lib/utils/errors'
import withT from '../../lib/withT'
import withMe from '../../lib/apollo/withMe'
import { chfFormat } from '../../lib/utils/format'
import track from '../../lib/matomo'
import { getConversionPayload } from '../../lib/utils/track'

import { gotoMerci, encodeSignInResponseQuery } from './Merci'

import { COUNTRIES, fields as getAddressFields } from '../Account/AddressForm'
import { query as addressQuery } from '../Account/enhancers'

import FieldSet from '../FieldSet'

import {
  Interaction,
  Button,
  Checkbox,
  InlineSpinner,
  Label,
  A,
} from '@project-r/styleguide'

import PaymentForm from '../Payment/Form'
import Consents, { getConsentsError } from './Consents'

import { loadStripe } from '../Payment/stripe'

import { useFieldSetState } from './utils'

import ErrorMessage, { ErrorContainer } from '../ErrorMessage'
import {
  useIsApplePayAvailable,
  useIsGooglePayAvailable,
} from '../Payment/Form/StripeWalletHelpers'
import useStripePaymentRequest, {
  PaymentRequestStatus,
  WalletPaymentMethods,
} from '../Payment/PaymentRequest/useStripePaymentRequest'
import { getPayerInformationFromEvent } from '../Payment/PaymentRequest/PaymentRequestEventHelper'
import { css } from 'glamor'

const { H2, P } = Interaction

const styles = {
  topMargin: css({
    marginTop: '16px',
  }),
}

const objectValues = (object) => Object.keys(object).map((key) => object[key])
const simpleHash = (object, delimiter = '|') => {
  return objectValues(object)
    .map((value) => {
      if (value && typeof value === 'object') {
        return simpleHash(value, delimiter === '|' ? '$' : `$${delimiter}`)
      }
      return `${value}`
    })
    .join(delimiter)
}

const getRequiredConsents = ({ requiresStatutes }) =>
  ['PRIVACY', 'TOS', requiresStatutes && 'STATUTE'].filter(Boolean)

const getContactFields = (t) => [
  {
    label: t('pledge/contact/firstName/label'),
    name: 'firstName',
    validator: (value) =>
      value.trim().length <= 0 && t('pledge/contact/firstName/error/empty'),
  },
  {
    label: t('pledge/contact/lastName/label'),
    name: 'lastName',
    validator: (value) =>
      value.trim().length <= 0 && t('pledge/contact/lastName/error/empty'),
  },
  {
    label: t('pledge/contact/email/label'),
    name: 'email',
    type: 'email',
    validator: (value) =>
      (value.trim().length <= 0 && t('pledge/contact/email/error/empty')) ||
      (!isEmail(value) && t('pledge/contact/email/error/invalid')),
  },
]

const SubmitWithHooks = ({ paymentMethods, ...props }) => {
  const { t, basePledge, customMe, me } = props
  const addressFields = useMemo(() => getAddressFields(t), [t])
  const contactFields = useMemo(
    () =>
      getContactFields(t).filter((field) => !customMe || !customMe[field.name]),
    [t, customMe],
  )

  const defaultContactState = useMemo(() => {
    const prefillMe = me || customMe || basePledge?.pledgeUser || {}
    return {
      firstName: prefillMe.firstName,
      lastName: prefillMe.lastName,
      email: prefillMe.email,
    }
  }, [me, customMe, basePledge])
  const contactState = useFieldSetState(contactFields, defaultContactState)

  const userName = [contactState.values.firstName, contactState.values.lastName]
    .filter(Boolean)
    .join(' ')
  const userAddress = props.customMe?.address

  const defaultAddress = useMemo(
    () => ({
      country: COUNTRIES[0],
      ...(userAddress
        ? {
            name: userAddress.name,
            line1: userAddress.line1,
            line2: userAddress.line2,
            postalCode: userAddress.postalCode,
            city: userAddress.city,
            country: userAddress.country,
          }
        : {}),
    }),
    [userAddress],
  )

  const addressState = useFieldSetState(addressFields, defaultAddress)
  const shippingAddressState = useFieldSetState(
    addressFields,
    props.basePledge?.pledgeShippingAddress || defaultAddress,
  )

  const [syncAddresses, setSyncAddresses] = useState(true)
  const [isApplePayAvailable] = useIsApplePayAvailable()
  const [isGooglePayAvailable] = useIsGooglePayAvailable()

  // In case STRIPE is an accepted payment method,
  // add additional payment methods such as Apple or Google Pay if available
  const enhancedPaymentMethods = useMemo(() => {
    if (!paymentMethods.includes('STRIPE')) {
      return paymentMethods
    }

    return [
      isApplePayAvailable ? WalletPaymentMethods.APPLE_PAY : null,
      isGooglePayAvailable ? WalletPaymentMethods.GOOGLE_PAY : null,
      ...paymentMethods,
    ].filter(Boolean)
  }, [paymentMethods, isApplePayAvailable, isGooglePayAvailable])

  const paymentRequest = useStripePaymentRequest({
    requestPayerEmail: !customMe,
    requestPayerName: !customMe || !customMe?.address,
    total: {
      amount: props.total ?? 0,
      label: t.first([
        `package/${props.query.package}/title`,
        'package/choose',
      ]),
    },
    requestShipping: props.requireShippingAddress || false,
    shippingOptions: props.requireShippingAddress
      ? [
          {
            id: 'default',
            label: t('account/pledges/free-delivery'),
            amount: 0,
          },
        ]
      : undefined,
  })

  return (
    <Submit
      {...props}
      paymentMethods={enhancedPaymentMethods}
      userName={userName}
      userAddress={userAddress}
      addressState={addressState}
      contactState={contactState}
      shippingAddressState={shippingAddressState}
      syncAddresses={props.requireShippingAddress && syncAddresses}
      setSyncAddresses={setSyncAddresses}
      paymentRequest={paymentRequest}
    />
  )
}

class Submit extends Component {
  constructor(props) {
    super(props)
    this.state = {
      emailVerify: false,
      consents: [],
      values: {},
      errors: {},
      dirty: {},
      loading: false,
    }
    if (props.basePledge) {
      const variables = this.submitVariables({
        ...props,
        ...props.basePledge,
      })
      const hash = simpleHash(variables)

      setPendingOrder(variables)

      this.state.pledgeHash = hash
      this.state.pledgeId = props.basePledge.id
    }
    this.paymentRef = (ref) => {
      this.payment =
        ref && ref.getWrappedInstance ? ref.getWrappedInstance() : ref
    }
  }

  isStripeWalletPayment() {
    return (
      this.state.values.paymentMethod &&
      this.state.values.paymentMethod?.startsWith('STRIPE-WALLET')
    )
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { t } = this.props
    // Skip if loading
    if (this.props.paymentRequest.status === PaymentRequestStatus.LOADING) {
      return
    }

    // Delay creation of a payment-request, which requires Stripe to be loaded,
    // until a wallet payment-method is selected
    const isUninitializedStripeWallet =
      this.isStripeWalletPayment() &&
      this.props.paymentRequest.status === PaymentRequestStatus.IDLE

    // Since we don't want to always load all Payment Providers data,
    // we must reinitialize when switching to a different wallet
    const isOutdatedStripeWallet =
      this.isStripeWalletPayment() &&
      this.props.paymentRequest.status !== PaymentRequestStatus.IDLE &&
      this.props.paymentRequest.usedWallet !== this.state.values?.paymentMethod

    const isUnavailableAndStripeWalletIsSelected =
      this.isStripeWalletPayment() &&
      this.props.paymentRequest.status === PaymentRequestStatus.UNAVAILABLE

    if (isUninitializedStripeWallet || isOutdatedStripeWallet) {
      this.setState(() => ({
        loading: t('account/pledges/payment/methods/loading'),
      }))

      const selectedPaymentMethod = this.state.values.paymentMethod

      // Create payment-request
      this.props.paymentRequest
        .initialize(selectedPaymentMethod)
        .then((status) => {
          this.setState(() => ({
            loading: false,
            walletError:
              status === PaymentRequestStatus.UNAVAILABLE
                ? t('account/pledges/payment/methods/unavailable')
                : null,
          }))
        })
        .catch((error) => {
          console.error('Wallet initialization error', error)
          this.setState(() => ({
            loading: false,
            walletError: t(
              'account/pledges/payment/methods/initialization/error',
            ),
          }))
        })
    } else if (
      isUnavailableAndStripeWalletIsSelected &&
      !this.state.walletError
    ) {
      this.setState(() => ({
        loading: false,
        walletError: t('account/pledges/payment/methods/unavailable'),
      }))
    } else if (!this.isStripeWalletPayment() && this.state.walletError) {
      this.setState(() => ({
        walletError: null,
      }))
    }
  }

  submitVariables(props) {
    const {
      contactState,
      total,
      options,
      reason,
      accessToken,
      customMe,
      addressState,
      requireShippingAddress,
      shippingAddressState,
      syncAddresses,
    } = props

    const shippingAddress = requireShippingAddress
      ? shippingAddressState.values
      : undefined

    return {
      total,
      options: options.map((option) => ({
        ...option,
        autoPay:
          option.autoPay !== undefined ? this.getAutoPayValue() : undefined,
      })),
      reason,
      user: contactState.fields.length
        ? contactState.fields.reduce(
            (user, field) => {
              user[field.name] = contactState.values[field.name]
              return user
            },
            customMe ? { email: customMe.email } : {},
          )
        : undefined,
      address: syncAddresses
        ? shippingAddress
        : this.isStripeWalletPayment() // in case of a wallet payment, enter based on billing address
        ? addressState.values
        : undefined,
      shippingAddress,
      accessToken:
        customMe && customMe.isUserOfCurrentSession ? undefined : accessToken,
    }
  }

  submitPledge(paymentMethodObject) {
    const {
      t,
      query,
      addressState,
      shippingAddressState,
      requireShippingAddress,
      contactState,
    } = this.props
    const errorMessages = this.getErrorMessages()

    if (errorMessages.length > 0) {
      this.props.onError()
      this.setState((state) => {
        const dirty = {
          ...state.dirty,
        }
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
      contactState.onChange({
        dirty: Object.keys(contactState.errors).reduce((agg, key) => {
          agg[key] = true
          return agg
        }, {}),
      })
      if (this.state.values.paymentMethod === 'PAYMENTSLIP') {
        addressState.onChange({
          dirty: Object.keys(addressState.errors).reduce((agg, key) => {
            agg[key] = true
            return agg
          }, {}),
        })
      }
      if (requireShippingAddress) {
        shippingAddressState.onChange({
          dirty: Object.keys(shippingAddressState.errors).reduce((agg, key) => {
            agg[key] = true
            return agg
          }, {}),
        })
      }
      return
    }

    const variables = this.submitVariables(this.props)

    const hash = simpleHash(variables)

    if (
      !this.state.submitError &&
      this.state.pledgeHash === hash &&
      // Special Case: POSTFINANCECARD
      // - we need a pledgeResponse with pfAliasId and pfSHA
      // - this can be missing if returning from a PSP redirect
      // - in those cases we create a new pledge
      (this.state.values.paymentMethod !== 'POSTFINANCECARD' ||
        this.state.pledgeResponse)
    ) {
      this.payPledge(this.state.pledgeId, this.state.pledgeResponse)
      return
    }

    this.setState(() => ({
      loading: t('pledge/submit/loading/submit'),
    }))

    return this.props
      .submit({
        ...variables,
        payload: getConversionPayload(query),
        consents: getRequiredConsents(this.props),
      })
      .then(({ data }) => {
        if (data.submitPledge.emailVerify) {
          this.setState(() => ({
            loading: false,
            emailVerify: true,
          }))

          // Rethrow error in case STRIPE-WALLET is used
          // This needs to be done in order to call payment-request
          // complete handler with 'fail'
          if (this.isStripeWalletPayment()) {
            throw new Error('Email verification required')
          }
          return
        }
        this.setState(() => ({
          loading: false,
          pledgeId: data.submitPledge.pledgeId,
          pledgeHash: hash,
          pledgeResponse: data.submitPledge,
          submitError: undefined,
        }))
        return this.payPledge(
          data.submitPledge.pledgeId,
          data.submitPledge,
          paymentMethodObject,
        )
      })
      .catch((error) => {
        // Rethrow error in case STRIPE-WALLET is used
        // This needs to be done in order to call payment-request
        // complete handler with 'fail'
        if (this.isStripeWalletPayment()) {
          throw error
        }

        const submitError = errorToString(error)

        this.setState(() => ({
          loading: false,
          pledgeId: undefined,
          pledgeHash: undefined,
          submitError,
        }))
      })
  }

  payPledge(pledgeId, pledgeResponse, paymentMethodObject) {
    const { paymentMethod } = this.state.values

    if (paymentMethod === 'PAYMENTSLIP') {
      this.payWithPaymentSlip(pledgeId)
    } else if (paymentMethod === 'POSTFINANCECARD') {
      this.payWithPostFinance(pledgeId, pledgeResponse)
    } else if (paymentMethod === 'STRIPE') {
      this.payWithStripe(pledgeId)
    } else if (this.isStripeWalletPayment()) {
      return this.payWithWallet(pledgeId, paymentMethodObject)
    } else if (paymentMethod === 'PAYPAL') {
      this.payWithPayPal(pledgeId)
    }
  }

  payWithPayPal(pledgeId) {
    const { t } = this.props

    this.setState(
      () => ({
        loading: t('pledge/submit/loading/paypal'),
        pledgeId: pledgeId,
      }),
      () => {
        this.payment.payPalForm.submit()
      },
    )
  }

  payWithPostFinance(pledgeId, pledgeResponse) {
    const { t } = this.props

    this.setState(
      () => ({
        loading: t('pledge/submit/loading/postfinance'),
        pledgeId: pledgeId,
        userId: pledgeResponse.userId,
        pfAliasId: pledgeResponse.pfAliasId,
        pfSHA: pledgeResponse.pfSHA,
      }),
      () => {
        this.payment.postFinanceForm.submit()
      },
    )
  }

  payWithPaymentSlip(pledgeId) {
    const { values } = this.state
    const { addressState, shippingAddressState, syncAddresses } = this.props
    this.pay({
      pledgeId,
      method: 'PAYMENTSLIP',
      paperInvoice: values.paperInvoice || false,
      address: syncAddresses
        ? shippingAddressState.values
        : addressState.values,
    })
  }

  pay(data) {
    const { t, me, customMe, packageName, contactState } = this.props

    const email = customMe ? customMe.email : contactState.values.email
    this.setState(() => ({
      loading: t('pledge/submit/loading/pay'),
    }))
    return this.props
      .pay({
        ...data,
        makeDefault: this.getAutoPayValue(),
      })
      .then(({ data: { payPledge } }) => {
        const baseQuery = {
          package: packageName,
          id: payPledge.pledgeId,
        }
        if (customMe && customMe.isListed) {
          baseQuery.statement = customMe.id
        }
        if (!me) {
          if (customMe || packageName === 'PROLONG') {
            gotoMerci({
              ...baseQuery,
              email,
            })
            return
          }
          this.props
            .signIn(email, 'pledge')
            .then(({ data: { signIn } }) =>
              gotoMerci({
                ...baseQuery,
                email: email,
                ...encodeSignInResponseQuery(signIn),
              }),
            )
            .catch((error) =>
              gotoMerci({
                ...baseQuery,
                email: email,
                signInError: errorToString(error),
              }),
            )
        } else {
          gotoMerci(baseQuery)
        }
      })
      .catch((error) => {
        this.setState(() => ({
          loading: false,
          paymentError: errorToString(error),
        }))

        // Rethrow error in case STRIPE-WALLET is used
        // This needs to be done in order to call payment-request
        // complete handler with 'fail'
        if (this.isStripeWalletPayment()) {
          throw error
        }
      })
  }

  payWithStripe(pledgeId) {
    const { t } = this.props
    const { values } = this.state

    this.setState(() => ({
      loading: t('pledge/submit/loading/stripe'),
    }))

    if (values.paymentSource) {
      this.pay({
        pledgeId,
        method: 'STRIPE',
        sourceId: values.paymentSource,
      })
      return
    }

    this.payment.stripe
      .createPaymentMethod()
      .then((paymentMethod) => {
        this.setState({
          loading: false,
          paymentError: undefined,
        })
        this.pay({
          pledgeId,
          method: 'STRIPE',
          sourceId: paymentMethod.id,
          pspPayload: paymentMethod,
        })
      })
      .catch((error) => {
        this.setState({
          loading: false,
          paymentError: error,
        })
      })
  }

  payWithWallet(pledgeId, paymentMethodObject) {
    const { t } = this.props
    const { values } = this.state
    this.setState(() => ({
      loading: t('pledge/submit/loading/stripe'),
    }))

    return this.pay({
      pledgeId,
      method: 'STRIPE',
      sourceId: paymentMethodObject.id,
      pspPayload: paymentMethodObject,
    })
  }

  handleWalletPayIntent() {
    const { t } = this.props
    this.setState(() => ({
      loading: t('account/pledges/payment/waiting'),
      walletError: null,
    }))

    this.props.paymentRequest.show(
      // Payment success handler
      async (ev) => {
        const payerInformation = getPayerInformationFromEvent(ev)

        this.props.contactState.onChange({
          values: {
            firstName: payerInformation.firstName || null,
            lastName: payerInformation.lastName || null,
            email: this.props.customMe?.email ?? payerInformation.email,
          },
          errors: {
            firstName: null,
            lastName: null,
            email: null,
          },
        })

        if (!this.props.customMe?.address && payerInformation.billingAddress) {
          this.props.addressState.onChange({
            values: payerInformation.billingAddress,
            errors: {},
          })
        }

        if (payerInformation.shippingAddress) {
          this.props.shippingAddressState.onChange({
            values: payerInformation.shippingAddress,
            errors: {},
          })
        }

        return this.submitPledge(ev.paymentMethod)
      },
      // Cancel Handler
      () => {
        this.setState(() => ({
          loading: false,
          submitError: t('account/pledges/payment/canceled'),
        }))
      },
    )
  }

  getErrorMessages() {
    const { consents, values } = this.state
    const {
      t,
      options,
      addressState,
      requireShippingAddress,
      shippingAddressState,
      syncAddresses,
      contactState,
    } = this.props

    return [
      {
        category: t('pledge/submit/error/title'),
        messages: [options.length < 1 && t('pledge/submit/package/error')]
          .concat(objectValues(this.props.errors))
          .concat(
            !this.isStripeWalletPayment() && objectValues(contactState.errors),
          )
          .concat(objectValues(this.state.errors))
          .concat([
            !values.paymentMethod && t('pledge/submit/payMethod/error'),
            getConsentsError(t, getRequiredConsents(this.props), consents),
          ])
          .filter(Boolean),
      },
      {
        category: t('pledge/address/shipping/title'),
        messages: []
          .concat(
            requireShippingAddress &&
              !this.isStripeWalletPayment() &&
              objectValues(shippingAddressState.errors),
          )
          .filter(Boolean),
      },
      {
        category: t('pledge/address/payment/title'),
        messages: []
          .concat(
            values.paymentMethod === 'PAYMENTSLIP' &&
              !syncAddresses &&
              objectValues(addressState.errors),
          )
          .filter(Boolean),
      },
    ].filter((d) => d.messages.length)
  }

  getAutoPayValue() {
    const { forceAutoPay, options } = this.props
    const {
      values: { paymentMethod },
      autoPay,
    } = this.state

    if (!paymentMethod || !paymentMethod.startsWith('STRIPE')) {
      return undefined
    }
    if (forceAutoPay) {
      return true
    }
    if (autoPay === undefined) {
      return (
        options.every((option) => option.autoPay !== false) &&
        options.some((option) => option.autoPay)
      )
    }
    return autoPay
  }

  renderAutoPay() {
    const {
      values: { paymentMethod },
    } = this.state
    if (!paymentMethod || !paymentMethod.startsWith('STRIPE')) {
      return null
    }
    const { t, packageName, forceAutoPay, options } = this.props

    if (options.every((option) => option.autoPay === undefined)) {
      return null
    }

    const label = t.first([
      `pledge/submit/${packageName}/autoPay`,
      'pledge/submit/autoPay',
    ])
    const note = t.first(
      [
        `pledge/submit/${packageName}/autoPay/note`,
        'pledge/submit/autoPay/note',
      ],
      undefined,
      null,
    )

    return (
      <div style={{ marginTop: 10 }}>
        {forceAutoPay ? (
          note && <Label>{note}</Label>
        ) : (
          <Checkbox
            checked={this.getAutoPayValue()}
            onChange={(_, checked) => {
              this.setState({ autoPay: checked })
            }}
          >
            {label}
            {note && <br />}
            {note && <Label>{note}</Label>}
          </Checkbox>
        )}
      </div>
    )
  }

  render() {
    const {
      emailVerify,
      paymentError,
      submitError,
      walletError,
      signInError,
      loading,
    } = this.state
    const {
      me,
      t,
      query,
      paymentMethods,
      packageName,
      requireShippingAddress,
      userName,
      userAddress,
      addressState,
      shippingAddressState,
      syncAddresses,
      setSyncAddresses,
      packageGroup,
      customMe,
      contactState,
    } = this.props

    const errorMessages = this.getErrorMessages()

    const contactPreface = t.first(
      [`pledge/contact/preface/${packageName}`, 'pledge/contact/preface'],
      undefined,
      '',
    )

    const showSignIn = this.state.showSignIn && !me

    return (
      <>
        {
          // Only render the browser API in case we're not using a browser payment API
          this.state.values.paymentMethod && !this.isStripeWalletPayment() && (
            <>
              {contactPreface && (
                <div style={{ marginBottom: 40 }}>
                  <P>{contactPreface}</P>
                </div>
              )}
              <H2>
                {t.first([
                  `pledge/contact/title/${packageName}`,
                  'pledge/contact/title',
                ])}
              </H2>
              <div style={{ marginTop: 10, marginBottom: 10 }}>
                {me ? (
                  <>
                    <Interaction.P>
                      {t('pledge/contact/signedinAs', {
                        nameOrEmail: me.name
                          ? `${me.name.trim()} (${me.email})`
                          : me.email,
                      })}{' '}
                      <A
                        href='#'
                        onClick={(e) => {
                          e.preventDefault()
                          this.setState({ emailVerify: false })
                          this.props.signOut().then(() => {
                            contactState.onChange({
                              values: {
                                firstName: '',
                                lastName: '',
                                email: '',
                              },
                              dirty: {
                                firstName: false,
                                lastName: false,
                                email: false,
                              },
                            })
                            this.setState({ showSignIn: false })
                          })
                        }}
                      >
                        {t('pledge/contact/signOut')}
                      </A>
                    </Interaction.P>
                    {/* TODO: add active membership info */}
                  </>
                ) : (
                  !customMe && (
                    <>
                      <A
                        href='#'
                        onClick={(e) => {
                          e.preventDefault()
                          this.setState(() => ({
                            showSignIn: !showSignIn,
                          }))
                        }}
                      >
                        {t(
                          `pledge/contact/signIn/${
                            showSignIn ? 'hide' : 'show'
                          }`,
                        )}
                      </A>
                      {!!showSignIn && (
                        <>
                          <br />
                          <br />
                          <SignIn context='pledge' />
                        </>
                      )}
                      <br />
                    </>
                  )
                )}
                {!showSignIn && (
                  <>
                    {customMe && !me ? (
                      <>
                        <Interaction.P>
                          <Label>{t('pledge/contact/email/label')}</Label>
                          <br />
                          {customMe.email}
                        </Interaction.P>
                        <br />
                        <Link
                          href={{
                            pathname: '/angebote',
                            query: {
                              package: packageName,
                            },
                          }}
                          replace
                          passHref
                        >
                          <A>{t('pledge/contact/signIn/wrongToken')}</A>
                        </Link>
                      </>
                    ) : (
                      <FieldSet {...contactState} />
                    )}
                  </>
                )}
              </div>
            </>
          )
        }
        <div {...styles.topMargin}>
          <PaymentForm
            key={me && me.id}
            ref={this.paymentRef}
            t={t}
            loadSources={!!me || !!query.token}
            accessToken={query.token}
            requireShippingAddress={requireShippingAddress}
            payload={{
              id: this.state.pledgeId,
              userId: this.state.userId,
              total: this.props.total,
              pfAliasId: this.state.pfAliasId,
              pfSHA: this.state.pfSHA,
            }}
            context={packageName}
            allowedMethods={paymentMethods}
            userName={userName}
            userAddress={userAddress}
            addressState={addressState}
            shippingAddressState={shippingAddressState}
            syncAddresses={syncAddresses}
            packageGroup={packageGroup}
            setSyncAddresses={setSyncAddresses}
            onChange={(fields) => {
              this.setState((state) => {
                const nextState = FieldSet.utils.mergeFields(fields)(state)

                if (
                  state.values.paymentMethod !==
                    nextState.values.paymentMethod ||
                  state.values.paymentSource !== nextState.values.paymentSource
                ) {
                  nextState.showErrors = false
                  nextState.errors = {}
                }

                return nextState
              })
            }}
            values={this.state.values}
            errors={this.state.errors}
            dirty={this.state.dirty}
          />
        </div>
        <div {...styles.topMargin}>
          {emailVerify && !me && (
            <div style={{ marginBottom: 40 }}>
              <P style={{ marginBottom: 10 }}>
                {t('pledge/submit/emailVerify/note')}
              </P>
              <SignIn context='pledge' email={contactState.values.email} />
            </div>
          )}
          {emailVerify && me && (
            <div style={{ marginBottom: 40 }}>
              <P>{t('pledge/submit/emailVerify/done')}</P>
            </div>
          )}
          {!!submitError && (
            <ErrorMessage style={{ margin: '0 0 40px' }} error={submitError} />
          )}
          {!!paymentError && (
            <ErrorMessage style={{ margin: '0 0 40px' }} error={paymentError} />
          )}
          {!!walletError && (
            <ErrorMessage style={{ margin: '0 0 40px' }} error={walletError}>
              <br />
              <span>{t('account/pledges/payment/methods/chose-another')}</span>
            </ErrorMessage>
          )}
          {!!signInError && (
            <ErrorMessage style={{ margin: '0 0 40px' }} error={signInError} />
          )}
          {loading ? (
            <div style={{ textAlign: 'center' }}>
              <InlineSpinner />
              <br />
              {loading}
            </div>
          ) : (
            <div>
              {!!this.state.showErrors && errorMessages.length > 0 && (
                <ErrorContainer style={{ marginBottom: 40 }}>
                  {errorMessages.map(({ category, messages }, i) => (
                    <Fragment key={i}>
                      {category}
                      <br />
                      <ul>
                        {messages.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </Fragment>
                  ))}
                </ErrorContainer>
              )}
              <Consents
                required={getRequiredConsents(this.props)}
                accepted={this.state.consents}
                onChange={(keys) => {
                  this.setState(() => ({
                    consents: keys,
                  }))
                }}
              />
              {this.renderAutoPay()}
              <br />
              <br />
              <Button
                block
                primary={!errorMessages.length}
                disabled={
                  errorMessages?.length > 0 ||
                  (this.isStripeWalletPayment() &&
                    this.props.paymentRequest?.status !==
                      PaymentRequestStatus.READY)
                }
                onClick={() => {
                  if (this.isStripeWalletPayment()) {
                    this.handleWalletPayIntent()
                  } else {
                    this.submitPledge()
                  }
                }}
              >
                {t('pledge/submit/button/pay', {
                  formattedChf: this.props.total
                    ? chfFormat(this.props.total / 100)
                    : '',
                })}
              </Button>
            </div>
          )}
        </div>
      </>
    )
  }
}

Submit.propTypes = {
  me: PropTypes.object,
  user: PropTypes.object,
  paymentMethods: PropTypes.array,
  total: PropTypes.number,
  reason: PropTypes.string,
  options: PropTypes.array.isRequired,
  submit: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  onError: PropTypes.func.isRequired,
}

const submitPledge = gql`
  mutation submitPledge(
    $total: Int!
    $options: [PackageOptionInput!]!
    $user: UserInput
    $reason: String
    $consents: [String!]
    $accessToken: ID
    $payload: JSON
    $address: AddressInput
    $shippingAddress: AddressInput
  ) {
    submitPledge(
      pledge: {
        total: $total
        options: $options
        user: $user
        address: $address
        shippingAddress: $shippingAddress
        reason: $reason
        accessToken: $accessToken
        payload: $payload
      }
      consents: $consents
    ) {
      pledgeId
      userId
      emailVerify
      pfAliasId
      pfSHA
    }
  }
`

const payPledge = gql`
  mutation payPledge(
    $pledgeId: ID!
    $method: PaymentMethod!
    $sourceId: String
    $pspPayload: JSON
    $address: AddressInput
    $paperInvoice: Boolean
    $makeDefault: Boolean
  ) {
    payPledge(
      pledgePayment: {
        pledgeId: $pledgeId
        method: $method
        sourceId: $sourceId
        makeDefault: $makeDefault
        pspPayload: $pspPayload
        address: $address
        paperInvoice: $paperInvoice
      }
    ) {
      pledgeId
      userId
      emailVerify
      stripePublishableKey
      stripeClientSecret
      stripePaymentIntentId
      companyId
    }
  }
`

const syncPaymentIntentMutation = gql`
  mutation syncPaymentIntent($stripePaymentIntentId: ID!, $companyId: ID!) {
    syncPaymentIntent(
      stripePaymentIntentId: $stripePaymentIntentId
      companyId: $companyId
    ) {
      pledgeStatus
      updatedPledge
    }
  }
`

let pendingOrder
const setPendingOrder = (order) => {
  pendingOrder = order
}

export const withPay = (Component) => {
  const EnhancedComponent = compose(
    graphql(syncPaymentIntentMutation, {
      props: ({ mutate }) => ({
        syncPaymentIntent: (variables) => {
          return mutate({
            variables,
          })
        },
      }),
    }),
    graphql(payPledge, {
      props: ({ mutate, ownProps: { syncPaymentIntent } }) => ({
        pay: (variables) =>
          mutate({
            variables,
            refetchQueries: [{ query: addressQuery }],
          }).then(async (response) => {
            const {
              data: { payPledge },
            } = response
            if (payPledge.stripeClientSecret) {
              const stripeClient = await loadStripe(
                payPledge.stripePublishableKey,
              )
              const confirmResult = await stripeClient.confirmCardPayment(
                payPledge.stripeClientSecret,
              )
              if (confirmResult.error) {
                throw confirmResult.error.message
              }
            }
            await Promise.all(
              [
                pendingOrder &&
                  new Promise((resolve) => {
                    pendingOrder.options.forEach((option) => {
                      track([
                        'addEcommerceItem',
                        option.templateId, // (required) SKU: Product unique identifier
                        undefined, // (optional) Product name
                        undefined, // (optional) Product category
                        option.price / 100, // (recommended) Product price
                        option.amount, // (optional, default to 1) Product quantity
                      ])
                    })
                    track([
                      'trackEcommerceOrder',
                      payPledge.pledgeId, // (required) Unique Order ID
                      pendingOrder.total / 100, // (required) Order Revenue grand total (includes tax, shipping, and subtracted discount)
                      undefined, // (optional) Order sub total (excludes shipping)
                      undefined, // (optional) Tax amount
                      undefined, // (optional) Shipping amount
                      !!pendingOrder.reason, // (optional) Discount offered (set to false for unspecified parameter)
                    ])
                    // give matomo half a second to track
                    setTimeout(() => {
                      resolve()
                    }, 500)
                  }),
                payPledge.stripePaymentIntentId && syncPaymentIntent(payPledge),
              ].filter(Boolean),
            )

            return response
          }),
      }),
    }),
    withSignIn,
  )(Component)
  return (props) => <EnhancedComponent {...props} />
}

const SubmitWithMutations = compose(
  graphql(submitPledge, {
    props: ({ mutate }) => ({
      submit: (variables) => {
        setPendingOrder(variables)

        return mutate({
          variables,
        })
      },
    }),
  }),
  withSignOut,
  withPay,
  withMe,
  withT,
)(SubmitWithHooks)

export default SubmitWithMutations
